import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Room, RoomStatus } from '../entities/Room';
import { RoomService } from '../entities/RoomService';
import { Service } from '../entities/Service';

const router = Router();
const roomRepository = AppDataSource.getRepository(Room);
const roomServiceRepository = AppDataSource.getRepository(RoomService);
const serviceRepository = AppDataSource.getRepository(Service);

// Get all rooms with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      floor,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const queryBuilder = roomRepository.createQueryBuilder('room');

    // Filters
    if (status) {
      queryBuilder.andWhere('room.status = :status', { status });
    }
    if (floor) {
      queryBuilder.andWhere('room.floor = :floor', {
        floor: parseInt(floor as string),
      });
    }
    if (minPrice) {
      queryBuilder.andWhere('room.price >= :minPrice', {
        minPrice: parseFloat(minPrice as string),
      });
    }
    if (maxPrice) {
      queryBuilder.andWhere('room.price <= :maxPrice', {
        maxPrice: parseFloat(maxPrice as string),
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(room.code ILIKE :search OR room.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order
    queryBuilder.orderBy('room.code', 'ASC');

    const [rooms, total] = await queryBuilder.getManyAndCount();

    res.json({
      data: rooms,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
});

// Get room by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const room = await roomRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error });
  }
});

// Create room
router.post('/', async (req: Request, res: Response) => {
  try {
    const room = roomRepository.create(req.body);
    const result = await roomRepository.save(room);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
  }
});

// Update room
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const room = await roomRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    roomRepository.merge(room, req.body);
    const result = await roomRepository.save(room);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error });
  }
});

// Delete room
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await roomRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error });
  }
});

// Check room availability
router.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const room = await roomRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      id: room.id,
      code: room.code,
      name: room.name,
      status: room.status,
      isAvailable: room.status === RoomStatus.AVAILABLE,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error });
  }
});

// Get room services
router.get('/:id/services', async (req: Request, res: Response) => {
  try {
    const roomServices = await roomServiceRepository.find({
      where: { roomId: parseInt(req.params.id), isActive: true },
      relations: ['service'],
    });

    res.json(roomServices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room services', error });
  }
});

// Add service to room
router.post('/:id/services', async (req: Request, res: Response) => {
  try {
    const { serviceId, customPrice, startDate, endDate, note } = req.body;

    // Check if room exists
    const room = await roomRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if service exists
    const service = await serviceRepository.findOneBy({ id: serviceId });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if already assigned
    const existing = await roomServiceRepository.findOne({
      where: { roomId: parseInt(req.params.id), serviceId },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'Service already assigned to room' });
    }

    const roomService = roomServiceRepository.create({
      roomId: parseInt(req.params.id),
      serviceId,
      customPrice,
      startDate,
      endDate,
      note,
    });

    const result = await roomServiceRepository.save(roomService);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding service to room', error });
  }
});

// Remove service from room
router.delete(
  '/:id/services/:serviceId',
  async (req: Request, res: Response) => {
    try {
      const result = await roomServiceRepository.delete({
        roomId: parseInt(req.params.id),
        serviceId: parseInt(req.params.serviceId),
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Room service not found' });
      }

      res.json({ message: 'Service removed from room successfully' });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error removing service from room', error });
    }
  }
);

// Get room statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await roomRepository.count();
    const available = await roomRepository.count({
      where: { status: RoomStatus.AVAILABLE },
    });
    const occupied = await roomRepository.count({
      where: { status: RoomStatus.OCCUPIED },
    });
    const maintenance = await roomRepository.count({
      where: { status: RoomStatus.MAINTENANCE },
    });
    const reserved = await roomRepository.count({
      where: { status: RoomStatus.RESERVED },
    });

    const occupancyRate =
      total > 0 ? ((occupied / total) * 100).toFixed(2) : '0.00';

    res.json({
      total,
      available,
      occupied,
      maintenance,
      reserved,
      occupancyRate: parseFloat(occupancyRate),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

export default router;
