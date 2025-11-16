import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Contract, ContractStatus } from '../entities/Contract';
import { Room, RoomStatus } from '../entities/Room';
import { Tenant } from '../entities/Tenant';
import { ContractTenant } from '../entities/ContractTenant';

const router = Router();
const contractRepository = AppDataSource.getRepository(Contract);
const roomRepository = AppDataSource.getRepository(Room);
const tenantRepository = AppDataSource.getRepository(Tenant);
const contractTenantRepository = AppDataSource.getRepository(ContractTenant);

// Get all contracts with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      roomId,
      tenantId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const queryBuilder = contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.room', 'room')
      .leftJoinAndSelect('contract.mainTenant', 'mainTenant');

    // Filters
    if (status) {
      queryBuilder.andWhere('contract.status = :status', { status });
    }
    if (roomId) {
      queryBuilder.andWhere('contract.roomId = :roomId', {
        roomId: parseInt(roomId as string),
      });
    }
    if (tenantId) {
      queryBuilder.andWhere('contract.mainTenantId = :tenantId', {
        tenantId: parseInt(tenantId as string),
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(contract.contractNumber ILIKE :search OR room.code ILIKE :search OR mainTenant.fullName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order
    queryBuilder.orderBy('contract.createdAt', 'DESC');

    const [contracts, total] = await queryBuilder.getManyAndCount();

    res.json({
      data: contracts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error });
  }
});

// Get contract by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: [
        'room',
        'mainTenant',
        'contractTenants',
        'contractTenants.tenant',
      ],
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contract', error });
  }
});

// Create contract
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roomId, mainTenantId, additionalTenants, ...contractData } =
      req.body;

    // Check if room exists and is available
    const room = await roomRepository.findOneBy({ id: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (
      room.status !== RoomStatus.AVAILABLE &&
      room.status !== RoomStatus.RESERVED
    ) {
      return res
        .status(400)
        .json({ message: 'Room is not available for contract' });
    }

    // Check if main tenant exists
    const mainTenant = await tenantRepository.findOneBy({ id: mainTenantId });
    if (!mainTenant) {
      return res.status(404).json({ message: 'Main tenant not found' });
    }

    // Create contract
    const contract = contractRepository.create({
      ...contractData,
      roomId,
      mainTenantId,
      status: ContractStatus.DRAFT,
    });
    const savedContract = (await contractRepository.save(
      contract
    )) as any as Contract;

    // Add additional tenants if provided
    if (additionalTenants && Array.isArray(additionalTenants)) {
      for (const tenantId of additionalTenants) {
        const tenant = await tenantRepository.findOneBy({ id: tenantId });
        if (tenant) {
          const contractTenant = contractTenantRepository.create({
            contractId: savedContract.id,
            tenantId,
          });
          await contractTenantRepository.save(contractTenant);
        }
      }
    }

    // Update room status to RESERVED
    room.status = RoomStatus.RESERVED;
    await roomRepository.save(room);

    res.status(201).json(savedContract);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contract', error });
  }
});

// Update contract
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await contractRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    contractRepository.merge(contract, req.body);
    const result = await contractRepository.save(contract);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contract', error });
  }
});

// Delete contract
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['room'],
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update room status back to AVAILABLE if contract is being deleted
    if (contract.room && contract.status !== ContractStatus.TERMINATED) {
      contract.room.status = RoomStatus.AVAILABLE;
      await roomRepository.save(contract.room);
    }

    await contractRepository.delete(parseInt(req.params.id));
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contract', error });
  }
});

// Activate contract (move from PENDING to ACTIVE)
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['room'],
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.status !== ContractStatus.DRAFT) {
      return res
        .status(400)
        .json({ message: 'Only draft contracts can be activated' });
    }

    contract.status = ContractStatus.ACTIVE;

    // Update room status to OCCUPIED
    if (contract.room) {
      contract.room.status = RoomStatus.OCCUPIED;
      await roomRepository.save(contract.room);
    }

    const result = await contractRepository.save(contract);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error activating contract', error });
  }
});

// Terminate contract
router.post('/:id/terminate', async (req: Request, res: Response) => {
  try {
    const { terminationDate, terminationReason } = req.body;

    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['room'],
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.status === ContractStatus.TERMINATED) {
      return res
        .status(400)
        .json({ message: 'Contract is already terminated' });
    }

    contract.status = ContractStatus.TERMINATED;
    contract.terminationDate = terminationDate
      ? new Date(terminationDate)
      : new Date();
    contract.terminationReason = terminationReason;

    // Update room status to AVAILABLE
    if (contract.room) {
      contract.room.status = RoomStatus.AVAILABLE;
      await roomRepository.save(contract.room);
    }

    const result = await contractRepository.save(contract);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error terminating contract', error });
  }
});

// Extend/Renew contract
router.post('/:id/renew', async (req: Request, res: Response) => {
  try {
    const { newEndDate } = req.body;

    if (!newEndDate) {
      return res.status(400).json({ message: 'New end date is required' });
    }

    const contract = await contractRepository.findOneBy({
      id: parseInt(req.params.id),
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.status !== ContractStatus.ACTIVE) {
      return res
        .status(400)
        .json({ message: 'Only active contracts can be renewed' });
    }

    contract.endDate = new Date(newEndDate);
    const result = await contractRepository.save(contract);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error renewing contract', error });
  }
});

// Get contract statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await contractRepository.count();
    const draft = await contractRepository.count({
      where: { status: ContractStatus.DRAFT },
    });
    const active = await contractRepository.count({
      where: { status: ContractStatus.ACTIVE },
    });
    const terminated = await contractRepository.count({
      where: { status: ContractStatus.TERMINATED },
    });
    const expired = await contractRepository.count({
      where: { status: ContractStatus.EXPIRED },
    });

    // Calculate total monthly revenue from active contracts
    const activeContracts = await contractRepository.find({
      where: { status: ContractStatus.ACTIVE },
    });
    const totalMonthlyRevenue = activeContracts.reduce((sum, contract) => {
      return sum + parseFloat(contract.monthlyRent.toString());
    }, 0);

    res.json({
      total,
      draft,
      active,
      terminated,
      expired,
      totalMonthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

// Get expiring contracts (contracts ending within next N days)
router.get('/expiring/:days', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.params.days);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

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

    res.json(contracts);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching expiring contracts', error });
  }
});

export default router;
