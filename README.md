# Full-Stack Application: Node.js + TypeORM + PostgreSQL + React

Ứng dụng full-stack với server Node.js sử dụng TypeORM và PostgreSQL, cùng client ReactJS.

## Cấu trúc dự án

```
pg/
├── server/          # Node.js + TypeORM + PostgreSQL
└── client/          # ReactJS với Vite
```

## Yêu cầu hệ thống

- Node.js (v18 hoặc cao hơn)
- PostgreSQL (v12 hoặc cao hơn)
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt PostgreSQL

**macOS (sử dụng Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Tạo database:**
```bash
createdb mydb
```

Hoặc sử dụng psql:
```bash
psql postgres
CREATE DATABASE mydb;
\q
```

### 2. Cài đặt Server

```bash
cd server
npm install
```

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mydb
```

### 3. Cài đặt Client

```bash
cd client
npm install
```

## Chạy ứng dụng

### Chạy Server (Terminal 1)

```bash
cd server
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### Chạy Client (Terminal 2)

```bash
cd client
npm run dev
```

Client sẽ chạy tại: http://localhost:3000

## API Endpoints

### Users API

- `GET /api/users` - Lấy danh sách tất cả users
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `POST /api/users` - Tạo user mới
  ```json
  {
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com"
  }
  ```
- `PUT /api/users/:id` - Cập nhật user
  ```json
  {
    "name": "Nguyen Van B",
    "email": "nguyenvanb@example.com"
  }
  ```
- `DELETE /api/users/:id` - Xóa user

## Tính năng

### Server
- ✅ Node.js với Express
- ✅ TypeORM cho database ORM
- ✅ PostgreSQL database
- ✅ TypeScript
- ✅ CRUD operations đầy đủ
- ✅ CORS enabled
- ✅ Environment variables

### Client
- ✅ ReactJS với TypeScript
- ✅ Vite cho build tool
- ✅ Axios cho API calls
- ✅ User management interface
- ✅ Create, Read, Update, Delete users
- ✅ Responsive design
- ✅ Error handling

## Cấu trúc Server

```
server/
├── src/
│   ├── entities/       # TypeORM entities
│   │   └── User.ts
│   ├── routes/         # API routes
│   │   └── users.ts
│   ├── data-source.ts  # TypeORM configuration
│   └── index.ts        # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Cấu trúc Client

```
client/
├── src/
│   ├── components/     # React components
│   │   └── UserList.tsx
│   ├── services/       # API services
│   │   └── userService.ts
│   ├── types/          # TypeScript types
│   │   └── User.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Build cho Production

### Server
```bash
cd server
npm run build
npm start
```

### Client
```bash
cd client
npm run build
npm run preview
```

## Docker Setup

### Chạy với Docker Compose (Development)

```bash
# Build và chạy tất cả services
docker-compose -f docker-compose.dev.yml up --build

# Chạy ở background
docker-compose -f docker-compose.dev.yml up -d

# Dừng services
docker-compose -f docker-compose.dev.yml down

# Dừng và xóa volumes
docker-compose -f docker-compose.dev.yml down -v
```

Services sẽ chạy tại:
- Client: http://localhost:3000
- Server: http://localhost:5000
- PostgreSQL: localhost:5432

### Chạy với Docker Compose (Production)

```bash
# Build và chạy
docker-compose up --build

# Chạy ở background
docker-compose up -d

# Dừng services
docker-compose down
```

### Docker Commands Hữu Ích

```bash
# Xem logs
docker-compose -f docker-compose.dev.yml logs -f

# Xem logs của service cụ thể
docker-compose -f docker-compose.dev.yml logs -f server

# Restart một service
docker-compose -f docker-compose.dev.yml restart server

# Exec vào container
docker-compose -f docker-compose.dev.yml exec server sh
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d mydb

# Xem container đang chạy
docker-compose -f docker-compose.dev.yml ps
```

## Lưu ý

- Đảm bảo PostgreSQL đang chạy trước khi khởi động server (hoặc dùng Docker)
- TypeORM `synchronize: true` chỉ nên dùng trong development
- Thay đổi database credentials trong `.env` theo môi trường của bạn
- Client proxy API calls đến server qua Vite proxy configuration
- Docker development mode có hot-reload cho cả server và client

## Troubleshooting

### Server không kết nối được database
- Kiểm tra PostgreSQL đang chạy: `pg_isready`
- Kiểm tra thông tin trong file `.env`
- Đảm bảo database đã được tạo

### Port đã được sử dụng
- Thay đổi PORT trong `.env` (server)
- Thay đổi port trong `vite.config.ts` (client)

## License

MIT
