import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Tenant, TenantStatus, Gender } from '../entities/Tenant';
import { ILike } from 'typeorm';

const router = Router();
const tenantRepository = AppDataSource.getRepository(Tenant);

// Get all tenants with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, gender, search, page = 1, limit = 10 } = req.query;

    const queryBuilder = tenantRepository.createQueryBuilder('tenant');

    // Filters
    if (status) {
      queryBuilder.andWhere('tenant.status = :status', { status });
    }
    if (gender) {
      queryBuilder.andWhere('tenant.gender = :gender', { gender });
    }
    if (search) {
      queryBuilder.andWhere(
        '(tenant.fullName ILIKE :search OR tenant.phone ILIKE :search OR tenant.email ILIKE :search OR tenant.idCard ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order
    queryBuilder.orderBy('tenant.createdAt', 'DESC');

    const [tenants, total] = await queryBuilder.getManyAndCount();

    res.json({
      data: tenants,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error });
  }
});

// Get tenant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await tenantRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant', error });
  }
});

// Create tenant
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if ID card already exists
    if (req.body.idCard) {
      const existing = await tenantRepository.findOne({
        where: { idCard: req.body.idCard },
      });
      if (existing) {
        return res.status(400).json({ message: 'ID card already registered' });
      }
    }

    const tenant = tenantRepository.create(req.body);
    const result = await tenantRepository.save(tenant);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tenant', error });
  }
});

// Update tenant
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await tenantRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check if ID card already exists for another tenant
    if (req.body.idCard && req.body.idCard !== tenant.idCard) {
      const existing = await tenantRepository.findOne({
        where: { idCard: req.body.idCard },
      });
      if (existing) {
        return res.status(400).json({ message: 'ID card already registered' });
      }
    }

    tenantRepository.merge(tenant, req.body);
    const result = await tenantRepository.save(tenant);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tenant', error });
  }
});

// Delete tenant
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await tenantRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tenant', error });
  }
});

// Get tenant contracts history
router.get('/:id/contracts', async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.id);

    // Check if tenant exists
    const tenant = await tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Query contracts where tenant is main tenant
    const { Contract } = await import('../entities/Contract');
    const contractRepository = AppDataSource.getRepository(Contract);

    const mainContracts = await contractRepository.find({
      where: { mainTenantId: tenantId },
      relations: ['room'],
      order: { createdAt: 'DESC' },
    });

    // Query contracts where tenant is additional tenant
    const { ContractTenant } = await import('../entities/ContractTenant');
    const contractTenantRepository =
      AppDataSource.getRepository(ContractTenant);

    const additionalContractRelations = await contractTenantRepository.find({
      where: { tenantId },
      relations: ['contract', 'contract.room'],
      order: { createdAt: 'DESC' },
    });

    res.json({
      mainContracts,
      additionalContracts: additionalContractRelations.map((ct) => ct.contract),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant contracts', error });
  }
});

// Get tenant statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await tenantRepository.count();
    const active = await tenantRepository.count({
      where: { status: TenantStatus.ACTIVE },
    });
    const inactive = await tenantRepository.count({
      where: { status: TenantStatus.INACTIVE },
    });

    const male = await tenantRepository.count({
      where: { gender: Gender.MALE },
    });
    const female = await tenantRepository.count({
      where: { gender: Gender.FEMALE },
    });
    const other = await tenantRepository.count({
      where: { gender: Gender.OTHER },
    });

    res.json({
      total,
      active,
      inactive,
      byGender: {
        male,
        female,
        other,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

export default router;
