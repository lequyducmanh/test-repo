import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Room, RoomStatus } from '../entities/Room';
import { Contract, ContractStatus } from '../entities/Contract';
import { Tenant, TenantStatus } from '../entities/Tenant';
import { Maintenance, MaintenanceStatus } from '../entities/Maintenance';
import { UtilityReading } from '../entities/UtilityReading';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const router = Router();
const roomRepository = AppDataSource.getRepository(Room);
const contractRepository = AppDataSource.getRepository(Contract);
const tenantRepository = AppDataSource.getRepository(Tenant);
const maintenanceRepository = AppDataSource.getRepository(Maintenance);
const utilityReadingRepository = AppDataSource.getRepository(UtilityReading);

// Dashboard overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Room statistics
    const totalRooms = await roomRepository.count();
    const availableRooms = await roomRepository.count({
      where: { status: RoomStatus.AVAILABLE },
    });
    const occupiedRooms = await roomRepository.count({
      where: { status: RoomStatus.OCCUPIED },
    });
    const maintenanceRooms = await roomRepository.count({
      where: { status: RoomStatus.MAINTENANCE },
    });

    // Tenant statistics
    const totalTenants = await tenantRepository.count();
    const activeTenants = await tenantRepository.count({
      where: { status: TenantStatus.ACTIVE },
    });

    // Contract statistics
    const totalContracts = await contractRepository.count();
    const activeContracts = await contractRepository.count({
      where: { status: ContractStatus.ACTIVE },
    });
    const draftContracts = await contractRepository.count({
      where: { status: ContractStatus.DRAFT },
    });

    // Calculate monthly revenue from active contracts
    const contracts = await contractRepository.find({
      where: { status: ContractStatus.ACTIVE },
    });
    const monthlyRevenue = contracts.reduce((sum, contract) => {
      return sum + parseFloat(contract.monthlyRent.toString());
    }, 0);

    // Maintenance statistics
    const pendingMaintenance = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.PENDING },
    });
    const inProgressMaintenance = await maintenanceRepository.count({
      where: { status: MaintenanceStatus.IN_PROGRESS },
    });

    // Expiring contracts (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const expiringContracts = await contractRepository.count({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: Between(today, thirtyDaysLater),
      },
    });

    res.json({
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate:
          totalRooms > 0
            ? ((occupiedRooms / totalRooms) * 100).toFixed(2)
            : '0.00',
      },
      tenants: {
        total: totalTenants,
        active: activeTenants,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
        draft: draftContracts,
        expiring: expiringContracts,
      },
      revenue: {
        monthly: monthlyRevenue,
        estimated: monthlyRevenue, // Can be extended with actual payment tracking
      },
      maintenance: {
        pending: pendingMaintenance,
        inProgress: inProgressMaintenance,
        total: pendingMaintenance + inProgressMaintenance,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching dashboard overview', error });
  }
});

// Occupancy rate over time
router.get('/occupancy-rate', async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query;
    const monthsCount = parseInt(months as string);

    const totalRooms = await roomRepository.count();
    const data = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // This is a simplified calculation - in production, you'd track historical data
      const occupiedRooms = await roomRepository.count({
        where: { status: RoomStatus.OCCUPIED },
      });

      const rate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      data.push({
        month,
        year,
        monthYear: `${year}-${String(month).padStart(2, '0')}`,
        occupiedRooms,
        totalRooms,
        occupancyRate: parseFloat(rate.toFixed(2)),
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching occupancy rate', error });
  }
});

// Revenue statistics
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query;
    const monthsCount = parseInt(months as string);

    const data = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Get active contracts for this month
      const contracts = await contractRepository.find({
        where: { status: ContractStatus.ACTIVE },
      });

      const revenue = contracts.reduce((sum, contract) => {
        return sum + parseFloat(contract.monthlyRent.toString());
      }, 0);

      data.push({
        month,
        year,
        monthYear: `${year}-${String(month).padStart(2, '0')}`,
        revenue: parseFloat(revenue.toFixed(2)),
        contractCount: contracts.length,
      });
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;

    res.json({
      data,
      summary: {
        total: parseFloat(totalRevenue.toFixed(2)),
        average: parseFloat(averageRevenue.toFixed(2)),
        months: data.length,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching revenue statistics', error });
  }
});

// Room status distribution
router.get('/room-status', async (req: Request, res: Response) => {
  try {
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
    const total = await roomRepository.count();

    res.json({
      available,
      occupied,
      maintenance,
      reserved,
      total,
      distribution: {
        available:
          total > 0 ? parseFloat(((available / total) * 100).toFixed(2)) : 0,
        occupied:
          total > 0 ? parseFloat(((occupied / total) * 100).toFixed(2)) : 0,
        maintenance:
          total > 0 ? parseFloat(((maintenance / total) * 100).toFixed(2)) : 0,
        reserved:
          total > 0 ? parseFloat(((reserved / total) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room status', error });
  }
});

// Expiring contracts
router.get('/expiring-contracts', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysCount = parseInt(days as string);

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysCount);

    const contracts = await contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.room', 'room')
      .leftJoinAndSelect('contract.mainTenant', 'mainTenant')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.endDate BETWEEN :today AND :futureDate', {
        today,
        futureDate,
      })
      .orderBy('contract.endDate', 'ASC')
      .getMany();

    res.json({
      count: contracts.length,
      contracts,
      days: daysCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching expiring contracts', error });
  }
});

// Maintenance summary
router.get('/maintenance-summary', async (req: Request, res: Response) => {
  try {
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

    // Get overdue maintenance
    const today = new Date();
    const overdue = await maintenanceRepository.count({
      where: {
        scheduledDate: LessThanOrEqual(today),
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });

    // Get recent completed maintenance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const recentCompleted = await maintenanceRepository.count({
      where: {
        status: MaintenanceStatus.COMPLETED,
        completedDate: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // Calculate total cost
    const completedMaintenances = await maintenanceRepository.find({
      where: { status: MaintenanceStatus.COMPLETED },
    });
    const totalCost = completedMaintenances.reduce((sum, m) => {
      return sum + (m.cost ? parseFloat(m.cost.toString()) : 0);
    }, 0);

    res.json({
      byStatus: {
        pending,
        inProgress,
        completed,
        cancelled,
      },
      overdue,
      recentCompleted,
      totalCost: parseFloat(totalCost.toFixed(2)),
      total: pending + inProgress + completed + cancelled,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching maintenance summary', error });
  }
});

// Pending utility readings
router.get('/pending-readings', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // Get occupied rooms
    const occupiedRooms = await roomRepository.find({
      where: { status: RoomStatus.OCCUPIED },
    });

    // Count rooms with pending readings
    let pendingCount = 0;
    const pendingRooms = [];

    for (const room of occupiedRooms) {
      const readings = await utilityReadingRepository.count({
        where: {
          roomId: room.id,
          month,
          year,
        },
      });

      if (readings === 0) {
        pendingCount++;
        pendingRooms.push({
          id: room.id,
          code: room.code,
          name: room.name,
        });
      }
    }

    res.json({
      month,
      year,
      totalOccupiedRooms: occupiedRooms.length,
      pendingCount,
      completedCount: occupiedRooms.length - pendingCount,
      completionRate:
        occupiedRooms.length > 0
          ? parseFloat(
              (
                ((occupiedRooms.length - pendingCount) / occupiedRooms.length) *
                100
              ).toFixed(2)
            )
          : 0,
      pendingRooms: pendingRooms.slice(0, 10), // Return first 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending readings', error });
  }
});

// Recent activities (simplified - can be extended with activity log table)
router.get('/recent-activities', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent contracts
    const recentContracts = await contractRepository.find({
      relations: ['room', 'mainTenant'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Get recent maintenance
    const recentMaintenance = await maintenanceRepository.find({
      relations: ['room'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const activities = [
      ...recentContracts.map((c) => ({
        type: 'contract',
        action: 'created',
        description: `New contract for room ${c.room?.code}`,
        date: c.createdAt,
        data: c,
      })),
      ...recentMaintenance.map((m) => ({
        type: 'maintenance',
        action: 'created',
        description: `New maintenance request for room ${m.room?.code}`,
        date: m.createdAt,
        data: m,
      })),
    ];

    // Sort by date and limit
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    const limitedActivities = activities.slice(0, parseInt(limit as string));

    res.json(limitedActivities);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching recent activities', error });
  }
});

export default router;
