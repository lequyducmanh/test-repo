import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { UtilityReading } from '../entities/UtilityReading';
import { Room, RoomStatus } from '../entities/Room';
import { Service, ServiceType } from '../entities/Service';
import { Between } from 'typeorm';

const router = Router();
const utilityReadingRepository = AppDataSource.getRepository(UtilityReading);
const roomRepository = AppDataSource.getRepository(Room);
const serviceRepository = AppDataSource.getRepository(Service);

// Create utility reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      roomId,
      serviceId,
      month,
      year,
      currentReading,
      readBy,
      previousReading,
      images,
      note,
    } = req.body;

    // Validate room exists
    const room = await roomRepository.findOneBy({ id: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Validate service exists and is metered type
    const service = await serviceRepository.findOneBy({ id: serviceId });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.type !== ServiceType.METERED) {
      return res
        .status(400)
        .json({ message: 'Service must be of type METERED' });
    }

    // Check if reading already exists for this month
    const existing = await utilityReadingRepository.findOne({
      where: { roomId, serviceId, month, year },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Reading already exists for this month' });
    }

    // Get previous reading if not provided
    let prevReading = previousReading;
    if (prevReading === undefined || prevReading === null) {
      const lastReading = await utilityReadingRepository.findOne({
        where: { roomId, serviceId },
        order: { year: 'DESC', month: 'DESC' },
      });
      prevReading = lastReading ? lastReading.currentReading : 0;
    }

    // Create reading
    const reading = utilityReadingRepository.create({
      roomId,
      serviceId,
      month,
      year,
      previousReading: prevReading,
      currentReading,
      readBy,
      images,
      note,
      readingDate: new Date(),
    });

    const result = await utilityReadingRepository.save(reading);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating utility reading', error });
  }
});

// Get utility readings by room
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { serviceId, limit = 12 } = req.query;

    const queryBuilder = utilityReadingRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.service', 'service')
      .leftJoinAndSelect('reading.reader', 'reader')
      .where('reading.roomId = :roomId', {
        roomId: parseInt(req.params.roomId),
      });

    if (serviceId) {
      queryBuilder.andWhere('reading.serviceId = :serviceId', {
        serviceId: parseInt(serviceId as string),
      });
    }

    queryBuilder
      .orderBy('reading.year', 'DESC')
      .addOrderBy('reading.month', 'DESC')
      .take(parseInt(limit as string));

    const readings = await queryBuilder.getMany();
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching utility readings', error });
  }
});

// Get utility readings by month
router.get('/month/:year/:month', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const { roomId, serviceId } = req.query;

    const queryBuilder = utilityReadingRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.room', 'room')
      .leftJoinAndSelect('reading.service', 'service')
      .where('reading.year = :year AND reading.month = :month', {
        year: parseInt(year),
        month: parseInt(month),
      });

    if (roomId) {
      queryBuilder.andWhere('reading.roomId = :roomId', {
        roomId: parseInt(roomId as string),
      });
    }
    if (serviceId) {
      queryBuilder.andWhere('reading.serviceId = :serviceId', {
        serviceId: parseInt(serviceId as string),
      });
    }

    queryBuilder.orderBy('room.code', 'ASC');

    const readings = await queryBuilder.getMany();
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching utility readings', error });
  }
});

// Get utility reading by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reading = await utilityReadingRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['room', 'service', 'reader'],
    });

    if (!reading) {
      return res.status(404).json({ message: 'Utility reading not found' });
    }

    res.json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching utility reading', error });
  }
});

// Update utility reading
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const reading = await utilityReadingRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!reading) {
      return res.status(404).json({ message: 'Utility reading not found' });
    }

    utilityReadingRepository.merge(reading, req.body);
    const result = await utilityReadingRepository.save(reading);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating utility reading', error });
  }
});

// Delete utility reading
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await utilityReadingRepository.delete(
      parseInt(req.params.id)
    );
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Utility reading not found' });
    }
    res.json({ message: 'Utility reading deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting utility reading', error });
  }
});

// Bulk create utility readings
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { readings } = req.body;

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: 'Readings array is required' });
    }

    const results = [];
    const errors = [];

    for (const readingData of readings) {
      try {
        const { roomId, serviceId, month, year, currentReading, readBy } =
          readingData;

        // Check if already exists
        const existing = await utilityReadingRepository.findOne({
          where: { roomId, serviceId, month, year },
        });
        if (existing) {
          errors.push({ roomId, serviceId, message: 'Reading already exists' });
          continue;
        }

        // Get previous reading
        const lastReading = await utilityReadingRepository.findOne({
          where: { roomId, serviceId },
          order: { year: 'DESC', month: 'DESC' },
        });
        const previousReading = lastReading ? lastReading.currentReading : 0;

        const reading = utilityReadingRepository.create({
          roomId,
          serviceId,
          month,
          year,
          previousReading,
          currentReading,
          readBy,
          readingDate: new Date(),
        });

        const saved = await utilityReadingRepository.save(reading);
        results.push(saved);
      } catch (error) {
        errors.push({ ...readingData, error: String(error) });
      }
    }

    res.status(201).json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error bulk creating utility readings', error });
  }
});

// Get rooms with pending readings for a specific month
router.get('/pending/:year/:month', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const { serviceId } = req.query;

    // Get all active rooms
    const rooms = await roomRepository.find({
      where: { status: RoomStatus.OCCUPIED },
    });

    // Get metered services
    const serviceQuery: any = { type: ServiceType.METERED, isActive: true };
    if (serviceId) {
      serviceQuery.id = parseInt(serviceId as string);
    }
    const services = await serviceRepository.find({ where: serviceQuery });

    const pending = [];

    for (const room of rooms) {
      for (const service of services) {
        const reading = await utilityReadingRepository.findOne({
          where: {
            roomId: room.id,
            serviceId: service.id,
            month: parseInt(month),
            year: parseInt(year),
          },
        });

        if (!reading) {
          pending.push({
            room,
            service,
            month: parseInt(month),
            year: parseInt(year),
          });
        }
      }
    }

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending readings', error });
  }
});

// Get utility consumption statistics
router.get('/statistics/consumption', async (req: Request, res: Response) => {
  try {
    const { roomId, serviceId, startMonth, startYear, endMonth, endYear } =
      req.query;

    const queryBuilder = utilityReadingRepository.createQueryBuilder('reading');

    if (roomId) {
      queryBuilder.andWhere('reading.roomId = :roomId', {
        roomId: parseInt(roomId as string),
      });
    }
    if (serviceId) {
      queryBuilder.andWhere('reading.serviceId = :serviceId', {
        serviceId: parseInt(serviceId as string),
      });
    }
    if (startYear && startMonth) {
      queryBuilder.andWhere(
        '(reading.year > :startYear OR (reading.year = :startYear AND reading.month >= :startMonth))',
        {
          startYear: parseInt(startYear as string),
          startMonth: parseInt(startMonth as string),
        }
      );
    }
    if (endYear && endMonth) {
      queryBuilder.andWhere(
        '(reading.year < :endYear OR (reading.year = :endYear AND reading.month <= :endMonth))',
        {
          endYear: parseInt(endYear as string),
          endMonth: parseInt(endMonth as string),
        }
      );
    }

    queryBuilder
      .orderBy('reading.year', 'ASC')
      .addOrderBy('reading.month', 'ASC');

    const readings = await queryBuilder.getMany();

    const totalConsumption = readings.reduce(
      (sum, reading) => sum + reading.consumption,
      0
    );
    const averageConsumption =
      readings.length > 0 ? totalConsumption / readings.length : 0;

    res.json({
      readings,
      statistics: {
        total: totalConsumption,
        average: averageConsumption,
        count: readings.length,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching consumption statistics', error });
  }
});

export default router;
