export interface Room {
  id: number;
  code: string;
  name: string;
  floor: number;
  area: number;
  price: number;
  deposit: number;
  maxOccupants: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  amenities?: Record<string, any>;
  description?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: number;
  fullName: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  idCard?: string;
  idCardDate?: Date;
  idCardPlace?: string;
  phone: string;
  email?: string;
  hometown?: string;
  currentAddress?: string;
  occupation?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: number;
  contractCode: string;
  roomId: number;
  room?: Room;
  mainTenantId: number;
  mainTenant?: Tenant;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  paymentDueDay: number;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  terminationDate?: Date;
  terminationReason?: string;
  terms?: Record<string, any>;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: number;
  name: string;
  type: 'FIXED' | 'VARIABLE' | 'METERED';
  price: number;
  unit?: string;
  isRequired: boolean;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Maintenance {
  id: number;
  roomId: number;
  room?: Room;
  title: string;
  description: string;
  type: 'REPAIR' | 'MAINTENANCE' | 'INSPECTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reportedByTenantId?: number;
  reportedByUserId?: number;
  assignedTo?: number;
  cost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  images?: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UtilityReading {
  id: number;
  roomId: number;
  room?: Room;
  serviceId: number;
  service?: Service;
  month: number;
  year: number;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: Date;
  readBy: number;
  reader?: User;
  images?: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardOverview {
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: string;
  };
  tenants: {
    total: number;
    active: number;
  };
  contracts: {
    total: number;
    active: number;
    draft: number;
    expiring: number;
  };
  revenue: {
    monthly: number;
    estimated: number;
  };
  maintenance: {
    pending: number;
    inProgress: number;
    total: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
