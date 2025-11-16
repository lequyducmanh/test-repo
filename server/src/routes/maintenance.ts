import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import {
  Maintenance,
  MaintenanceType,
  MaintenancePriority,
  MaintenanceStatus,
} from '../entities/Maintenance';
import { Room } from '../entities/Room';

const router = Router();
const maintenanceRepository = AppDataSource.getRepository(Maintenance);
const roomRepository = AppDataSource.getRepository(Room);

// Get all maintenance requests with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      type,
      roomId,
      assignedTo,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const queryBuilder = maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.room', 'room')
      .leftJoinAndSelect('maintenance.assignedToUser', 'assignedToUser')
      .leftJoinAndSelect('maintenance.reportedByTenant', 'reportedByTenant')
      .leftJoinAndSelect('maintenance.reportedByUser', 'reportedByUser');

    // Filters
    if (status) {
      queryBuilder.andWhere('maintenance.status = :status', { status });
    }
    if (priority) {
      queryBuilder.andWhere('maintenance.priority = :priority', { priority });
    }
    if (type) {
      queryBuilder.andWhere('maintenance.type = :type', { type });
    }
    if (roomId) {
      queryBuilder.andWhere('maintenance.roomId = :roomId', {
        roomId: parseInt(roomId as string),
      });
    }
    if (assignedTo) {
      queryBuilder.andWhere('maintenance.assignedTo = :assignedTo', {
        assignedTo: parseInt(assignedTo as string),
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(maintenance.title ILIKE :search OR maintenance.description ILIKE :search OR room.code ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order by priority and creation date
    queryBuilder
      .orderBy(
        "CASE maintenance.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 END",
        'ASC'
      )
      .addOrderBy('maintenance.createdAt', 'DESC');

    const [maintenances, total] = await queryBuilder.getManyAndCount();

    res.json({
      data: maintenances,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching maintenance requests', error });
  }
});

// Get maintenance by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const maintenance = await maintenanceRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: [
        'room',
        'assignedToUser',
        'reportedByTenant',
        'reportedByUser',
      ],
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(maintenance);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching maintenance request', error });
  }
});

// Create maintenance request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roomId, reportedByTenantId, reportedByUserId, ...maintenanceData } =
      req.body;

    // Validate room exists
    const room = await roomRepository.findOneBy({ id: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Must have either tenant or user reporter
    if (!reportedByTenantId && !reportedByUserId) {
      return res
        .status(400)
        .json({ message: 'Reporter is required (tenant or user)' });
    }

    const maintenance = maintenanceRepository.create({
      ...maintenanceData,
      roomId,
      reportedByTenantId,
      reportedByUserId,
      status: MaintenanceStatus.PENDING,
    });

    const result = await maintenanceRepository.save(maintenance);
    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating maintenance request', error });
  }
});

// Update maintenance request
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const maintenance = await maintenanceRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    maintenanceRepository.merge(maintenance, req.body);
    const result = await maintenanceRepository.save(maintenance);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating maintenance request', error });
  }
});

// Update maintenance status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!Object.values(MaintenanceStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const maintenance = await maintenanceRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    maintenance.status = status;

    if (status === MaintenanceStatus.COMPLETED) {
      maintenance.completedDate = new Date();
    }

    const result = await maintenanceRepository.save(maintenance);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating maintenance status', error });
  }
});

// Assign maintenance to user
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: 'assignedTo is required' });
    }

    const maintenance = await maintenanceRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    maintenance.assignedTo = assignedTo;

    if (maintenance.status === MaintenanceStatus.PENDING) {
      maintenance.status = MaintenanceStatus.IN_PROGRESS;
    }

    const result = await maintenanceRepository.save(maintenance);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error assigning maintenance request', error });
  }
});

// Delete maintenance request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await maintenanceRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting maintenance request', error });
  }
});

// Get maintenance history by room
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const maintenances = await maintenanceRepository.find({
      where: { roomId: parseInt(req.params.roomId) },
      relations: ['assignedToUser'],
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string),
    });

    res.json(maintenances);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching room maintenance history', error });
  }
});

// Get maintenance statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await maintenanceRepository.count();
    const pending = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.PENDING },
    });
    const inProgress = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.IN_PROGRESS },
    });
    const completed = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.COMPLETED },
    });
    const cancelled = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.CANCELLED },
    });

    const urgent = await maintenanceRepository.count({
      where: { priority: MaintenancePriority.URGENT },
    });
    const high = await maintenanceRepository.count({
      where: { priority: MaintenancePriority.HIGH },
    });
    const medium = await maintenanceRepository.count({
      where: { priority: MaintenancePriority.MEDIUM },
    });
    const low = await maintenanceRepository.count({
      where: { priority: MaintenancePriority.LOW },
    });

    const repair = await maintenanceRepository.count({
      where: { type: MaintenanceType.REPAIR },
    });
    const maintenance = await maintenanceRepository.count({
      where: { type: MaintenanceType.MAINTENANCE },
    });
    const inspection = await maintenanceRepository.count({
      where: { type: MaintenanceType.INSPECTION },
    });

    // Calculate total cost of completed maintenance
    const completedMaintenances = await maintenanceRepository.find({
      where: { status: MaintenanceStatus.COMPLETED },
    });
    const totalCost = completedMaintenances.reduce((sum, m) => {
      return sum + (m.cost ? parseFloat(m.cost.toString()) : 0);
    }, 0);

    res.json({
      total,
      byStatus: { pending, inProgress, completed, cancelled },
      byPriority: { urgent, high, medium, low },
      byType: { repair, maintenance, inspection },
      totalCost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching maintenance statistics', error });
  }
});

// Get overdue maintenance (scheduled date passed but not completed)
router.get('/overdue/list', async (req: Request, res: Response) => {
  try {
    const today = new Date();

    const maintenances = await maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.room', 'room')
      .leftJoinAndSelect('maintenance.assignedToUser', 'assignedToUser')
      .where('maintenance.scheduledDate < :today', { today })
      .andWhere('maintenance.status NOT IN (:...statuses)', {
        statuses: [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED],
      })
      .orderBy('maintenance.scheduledDate', 'ASC')
      .getMany();

    res.json(maintenances);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching overdue maintenance', error });
  }
});

export default router;
