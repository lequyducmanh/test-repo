import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Service, ServiceType } from '../entities/Service';

const router = Router();
const serviceRepository = AppDataSource.getRepository(Service);

// Get all services with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      isActive,
      isRequired,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const queryBuilder = serviceRepository.createQueryBuilder('service');

    // Filters
    if (type) {
      queryBuilder.andWhere('service.type = :type', { type });
    }
    if (isActive !== undefined) {
      queryBuilder.andWhere('service.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }
    if (isRequired !== undefined) {
      queryBuilder.andWhere('service.isRequired = :isRequired', {
        isRequired: isRequired === 'true',
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order
    queryBuilder.orderBy('service.name', 'ASC');

    const [services, total] = await queryBuilder.getManyAndCount();

    res.json({
      data: services,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
});

// Get service by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const service = await serviceRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error });
  }
});

// Create service
router.post('/', async (req: Request, res: Response) => {
  try {
    const service = serviceRepository.create(req.body);
    const result = await serviceRepository.save(service);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error });
  }
});

// Update service
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const service = await serviceRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    serviceRepository.merge(service, req.body);
    const result = await serviceRepository.save(service);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
});

// Delete service
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await serviceRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
});

// Get services by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const type = req.params.type.toUpperCase() as ServiceType;

    if (!Object.values(ServiceType).includes(type)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }

    const services = await serviceRepository.find({
      where: { type, isActive: true },
      order: { name: 'ASC' },
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services by type', error });
  }
});

// Get required services (default services for all rooms)
router.get('/required/list', async (req: Request, res: Response) => {
  try {
    const services = await serviceRepository.find({
      where: {
        isRequired: true,
        isActive: true,
      },
      order: { name: 'ASC' },
    });

    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching required services', error });
  }
});

// Get service statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await serviceRepository.count();
    const active = await serviceRepository.count({ where: { isActive: true } });
    const inactive = await serviceRepository.count({
      where: { isActive: false },
    });

    const fixed = await serviceRepository.count({
      where: { type: ServiceType.FIXED },
    });
    const variable = await serviceRepository.count({
      where: { type: ServiceType.VARIABLE },
    });
    const metered = await serviceRepository.count({
      where: { type: ServiceType.METERED },
    });

    const required = await serviceRepository.count({
      where: { isRequired: true },
    });

    res.json({
      total,
      active,
      inactive,
      byType: {
        fixed,
        variable,
        metered,
      },
      required,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

export default router;
