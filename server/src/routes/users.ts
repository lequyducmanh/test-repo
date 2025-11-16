import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Get all users with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;

    const queryBuilder = userRepository.createQueryBuilder('user');

    // Filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    queryBuilder.skip(skip).take(parseInt(limit as string));

    // Order
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove password from response
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      data: sanitizedUsers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Get user by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// Create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // TODO: Hash password before saving (use bcrypt in production)
    const user = userRepository.create(req.body);
    const result = await userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = result as any;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email: req.body.email },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Don't update password directly through this route
    const { password, ...updateData } = req.body;

    userRepository.merge(user, updateData);
    const result = await userRepository.save(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Toggle user active status
router.put('/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    const result = await userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = result;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user status', error });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await userRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Get user statistics
router.get('/statistics/summary', async (req: Request, res: Response) => {
  try {
    const total = await userRepository.count();
    const active = await userRepository.count({ where: { isActive: true } });
    const inactive = await userRepository.count({ where: { isActive: false } });

    const admin = await userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const manager = await userRepository.count({
      where: { role: UserRole.MANAGER },
    });
    const staff = await userRepository.count({
      where: { role: UserRole.STAFF },
    });

    res.json({
      total,
      active,
      inactive,
      byRole: {
        admin,
        manager,
        staff,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user statistics', error });
  }
});

export default router;
