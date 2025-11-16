# DATABASE SCHEMA - QUẢN LÝ PHÒNG TRỌ

## ERD Diagram (Entity Relationship Diagram)

```
┌─────────────┐
│    User     │
│─────────────│
│ id          │
│ name        │
│ email       │
│ password    │
│ role        │
│ phone       │
│ avatar      │
│ isActive    │
└─────────────┘
      │
      │ (readBy)
      │
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Room     │───────│ RoomService  │───────│   Service   │
│─────────────│       │──────────────│       │─────────────│
│ id          │       │ id           │       │ id          │
│ code        │       │ roomId       │       │ name        │
│ name        │       │ serviceId    │       │ type        │
│ floor       │       │ customPrice  │       │ price       │
│ area        │       │ isActive     │       │ unit        │
│ price       │       └──────────────┘       │ isRequired  │
│ deposit     │              │               │ description │
│ maxOccupants│              │               │ isActive    │
│ status      │              │               └─────────────┘
│ amenities   │              │
│ description │              │
└─────────────┘              │
      │                      │
      │                      │
      ├──────────────────────┤
      │                      │
┌─────────────┐       ┌──────────────┐
│ RoomImage   │       │   Utility    │
│─────────────│       │   Reading    │
│ id          │       │──────────────│
│ roomId      │       │ id           │
│ url         │       │ roomId       │
│ type        │       │ serviceId    │
│ caption     │       │ month/year   │
│ order       │       │ prevReading  │
└─────────────┘       │ currReading  │
                      │ consumption  │
                      │ readingDate  │
                      │ readBy       │
                      │ images       │
                      └──────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Tenant    │───────│  Contract    │       │   Room      │
│─────────────│       │  Tenant      │       │─────────────│
│ id          │       │──────────────│       │ (from above)│
│ fullName    │       │ id           │       └─────────────┘
│ dateOfBirth │       │ contractId   │              │
│ gender      │       │ tenantId     │              │
│ idCard      │       │ isMainTenant │              │
│ idCardDate  │       │ joinDate     │              │
│ idCardPlace │       │ leaveDate    │              │
│ phone       │       └──────────────┘              │
│ email       │              │                      │
│ hometown    │              │                      │
│ currentAddr │       ┌──────────────┐              │
│ occupation  │       │  Contract    │──────────────┘
│ emergency   │       │──────────────│
│ Contact     │       │ id           │
│ status      │       │ contractCode │
│ note        │       │ roomId       │
└─────────────┘       │ mainTenantId │
      │               │ startDate    │
      │               │ endDate      │
      │               │ monthlyRent  │
      │               │ deposit      │
      │               │ paymentDueDay│
      │               │ status       │
      │               │ termination  │
      │               │ Date/Reason  │
      └───────────────│ terms        │
                      └──────────────┘

┌─────────────┐
│ Maintenance │
│─────────────│
│ id          │
│ roomId      │
│ title       │
│ description │
│ type        │
│ priority    │
│ status      │
│ reportedBy  │
│ assignedTo  │
│ cost        │
│ scheduledDate│
│ completedDate│
│ images      │
└─────────────┘
```

---

## 📊 TABLES DETAIL

### 1. **users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'STAFF', -- ADMIN, MANAGER, STAFF
  phone VARCHAR(20),
  avatar VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. **rooms**
```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  floor INTEGER,
  area DECIMAL(6,2), -- m²
  price DECIMAL(12,2) NOT NULL,
  deposit DECIMAL(12,2),
  max_occupants INTEGER DEFAULT 2,
  status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
  amenities JSONB, -- {ac: true, fridge: true, washer: false, wifi: true}
  description TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_floor ON rooms(floor);
```

### 3. **room_images**
```sql
CREATE TABLE room_images (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  type VARCHAR(20) DEFAULT 'GALLERY', -- MAIN, GALLERY
  caption VARCHAR(255),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_room_images_room_id ON room_images(room_id);
```

### 4. **tenants**
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10), -- MALE, FEMALE, OTHER
  id_card VARCHAR(20) UNIQUE,
  id_card_date DATE,
  id_card_place VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  hometown VARCHAR(255),
  current_address VARCHAR(255),
  occupation VARCHAR(100),
  emergency_contact JSONB, -- {name, phone, relationship}
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_tenants_id_card ON tenants(id_card);
CREATE INDEX idx_tenants_status ON tenants(status);
```

### 5. **services**
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- FIXED, VARIABLE, METERED
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(20), -- kwh, m3, month, person
  is_required BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_is_active ON services(is_active);
```

### 6. **room_services**
```sql
CREATE TABLE room_services (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price DECIMAL(12,2), -- NULL = dùng giá gốc
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, service_id)
);

CREATE INDEX idx_room_services_room_id ON room_services(room_id);
CREATE INDEX idx_room_services_service_id ON room_services(service_id);
```

### 7. **contracts**
```sql
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  contract_code VARCHAR(50) UNIQUE NOT NULL,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  main_tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(12,2) NOT NULL,
  deposit DECIMAL(12,2) NOT NULL,
  payment_due_day INTEGER DEFAULT 5, -- 1-31
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, EXPIRED, TERMINATED
  termination_date DATE,
  termination_reason TEXT,
  terms JSONB,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_room_id ON contracts(room_id);
CREATE INDEX idx_contracts_main_tenant_id ON contracts(main_tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
```

### 8. **contract_tenants**
```sql
CREATE TABLE contract_tenants (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  is_main_tenant BOOLEAN DEFAULT false,
  join_date DATE NOT NULL,
  leave_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_tenants_contract_id ON contract_tenants(contract_id);
CREATE INDEX idx_contract_tenants_tenant_id ON contract_tenants(tenant_id);
```

### 9. **utility_readings**
```sql
CREATE TABLE utility_readings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  previous_reading DECIMAL(10,2) DEFAULT 0,
  current_reading DECIMAL(10,2) NOT NULL,
  consumption DECIMAL(10,2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  reading_date DATE NOT NULL,
  read_by INTEGER REFERENCES users(id),
  images JSONB, -- [url1, url2]
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, service_id, month, year)
);

CREATE INDEX idx_utility_readings_room_id ON utility_readings(room_id);
CREATE INDEX idx_utility_readings_month_year ON utility_readings(month, year);
```

### 10. **maintenance**
```sql
CREATE TABLE maintenance (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'REPAIR', -- REPAIR, MAINTENANCE, INSPECTION
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  reported_by INTEGER REFERENCES tenants(id),
  assigned_to INTEGER REFERENCES users(id),
  cost DECIMAL(12,2) DEFAULT 0,
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  images JSONB, -- [url1, url2]
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maintenance_room_id ON maintenance(room_id);
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_maintenance_priority ON maintenance(priority);
CREATE INDEX idx_maintenance_assigned_to ON maintenance(assigned_to);
```

---

## 🔗 RELATIONSHIPS

### One-to-Many
- Room → RoomImages (1:N)
- Room → RoomServices (1:N)
- Room → UtilityReadings (1:N)
- Room → Contracts (1:N)
- Room → Maintenance (1:N)
- Service → RoomServices (1:N)
- Service → UtilityReadings (1:N)
- Tenant → Contracts (1:N as main tenant)
- Contract → ContractTenants (1:N)
- User → UtilityReadings (1:N as reader)
- User → Maintenance (1:N as assigned)

### Many-to-Many
- Room ↔ Service (through RoomServices)
- Contract ↔ Tenant (through ContractTenants)

---

## 📌 BUSINESS RULES

### Room Status Transitions
```
AVAILABLE → RESERVED → OCCUPIED
           ↓         ↓
      MAINTENANCE ← ─┘
           ↓
      AVAILABLE
```

### Contract Status Transitions
```
DRAFT → ACTIVE → EXPIRED
         ↓
    TERMINATED
```

### Maintenance Status Flow
```
PENDING → IN_PROGRESS → COMPLETED
           ↓
       CANCELLED
```

### Constraints
1. Một phòng chỉ có 1 hợp đồng ACTIVE tại 1 thời điểm
2. Contract end_date > start_date
3. Utility current_reading >= previous_reading
4. Room status = OCCUPIED khi có contract ACTIVE
5. payment_due_day: 1-31
6. Không xóa được Room/Tenant có Contract ACTIVE

---

## 🎯 INDEXES STRATEGY

### Primary Indexes (Auto-created)
- All PRIMARY KEY columns

### Foreign Key Indexes
- All foreign key columns để tăng tốc JOINs

### Query Optimization Indexes
- `users.email` - Login
- `rooms.status` - Filter phòng trống
- `contracts.status`, `contracts.end_date` - Tìm hợp đồng sắp hết hạn
- `tenants.phone`, `tenants.id_card` - Search tenant
- `utility_readings(room_id, month, year)` - Composite index cho queries thường dùng

---

## 🔄 MIGRATION ORDER

1. users
2. rooms
3. room_images
4. tenants
5. services
6. room_services
7. contracts
8. contract_tenants
9. utility_readings
10. maintenance

---

## 💾 SAMPLE DATA SCENARIOS

### Service Types
- **METERED**: Điện (kwh), Nước (m³)
- **FIXED**: Internet, Rác, Bảo vệ (tháng)
- **VARIABLE**: Giữ xe (theo số xe)

### Room Amenities Example
```json
{
  "airConditioner": true,
  "fridge": true,
  "washingMachine": false,
  "wifi": true,
  "wardrobe": true,
  "bed": true,
  "privateToilet": true
}
```

### Emergency Contact Example
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "relationship": "Cha"
}
```
