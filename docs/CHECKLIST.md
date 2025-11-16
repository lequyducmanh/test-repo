# QUẢN LÝ PHÒNG TRỌ - CHECKLIST TASKS

## 📋 TỔNG QUAN Dự ÁN
Hệ thống quản lý phòng trọ với các chức năng: quản lý phòng, người thuê, hợp đồng, dịch vụ, và bảo trì.

---

## ✅ PHASE 1: SETUP & CƠ SỞ DỮ LIỆU
- [x] Setup project structure (Node.js + TypeORM + PostgreSQL)
- [x] Setup ReactJS client với Vite
- [x] Setup Docker Compose
- [x] Cấu hình TypeORM với migrations
- [x] Tạo migration cho User table

---

## 🗄️ PHASE 2: DATABASE DESIGN & ENTITIES

### Task 1: Tạo Entity - Room (Phòng trọ)
- [ ] Tạo `Room` entity với các trường:
  - id, code (mã phòng), name
  - floor (tầng), area (diện tích m²)
  - price (giá thuê), deposit (tiền cọc)
  - maxOccupants (số người tối đa)
  - status (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
  - amenities (JSON: điều hòa, tủ lạnh, máy giặt, wifi...)
  - description, note
  - createdAt, updatedAt
- [ ] Tạo migration cho Room table

### Task 2: Tạo Entity - Tenant (Người thuê)
- [ ] Tạo `Tenant` entity với các trường:
  - id, fullName, dateOfBirth, gender
  - idCard (CMND/CCCD), idCardDate, idCardPlace
  - phone, email
  - hometown (quê quán), currentAddress
  - occupation (nghề nghiệp)
  - emergencyContact (JSON: tên, SĐT, quan hệ)
  - status (ACTIVE, INACTIVE)
  - note
  - createdAt, updatedAt
- [ ] Tạo migration cho Tenant table

### Task 3: Tạo Entity - Service (Dịch vụ)
- [ ] Tạo `Service` entity với các trường:
  - id, name (tên dịch vụ)
  - type (FIXED, VARIABLE, METERED)
    - FIXED: cố định (rác, internet...)
    - VARIABLE: theo số lượng
    - METERED: theo đồng hồ (điện, nước)
  - price (đơn giá)
  - unit (đơn vị: kwh, m³, tháng...)
  - isRequired (bắt buộc hay không)
  - description
  - isActive
  - createdAt, updatedAt
- [ ] Tạo migration cho Service table

### Task 4: Tạo Entity - RoomService (Dịch vụ áp dụng cho phòng)
- [ ] Tạo `RoomService` entity (Many-to-Many):
  - id, roomId, serviceId
  - customPrice (giá tùy chỉnh cho phòng này)
  - isActive
  - startDate, endDate
  - note
  - createdAt, updatedAt
- [ ] Tạo migration cho RoomService table
- [ ] Thiết lập quan hệ Room ↔ RoomService ↔ Service

### Task 5: Tạo Entity - Contract (Hợp đồng thuê)
- [ ] Tạo `Contract` entity với các trường:
  - id, contractCode (mã hợp đồng)
  - roomId (quan hệ với Room)
  - mainTenantId (người thuê chính)
  - startDate, endDate
  - monthlyRent (tiền thuê hàng tháng)
  - deposit (tiền cọc)
  - paymentDueDay (ngày đóng tiền hàng tháng: 1-31)
  - status (DRAFT, ACTIVE, EXPIRED, TERMINATED)
  - terminationDate, terminationReason
  - terms (JSON: các điều khoản)
  - note
  - createdAt, updatedAt
- [ ] Tạo migration cho Contract table
- [ ] Thiết lập quan hệ Contract → Room (Many-to-One)
- [ ] Thiết lập quan hệ Contract → Tenant (Many-to-One)

### Task 6: Tạo Entity - ContractTenant (Người thuê trong hợp đồng)
- [ ] Tạo `ContractTenant` entity:
  - id, contractId, tenantId
  - isMainTenant (người thuê chính hay không)
  - joinDate, leaveDate
  - createdAt, updatedAt
- [ ] Tạo migration cho ContractTenant table
- [ ] Thiết lập quan hệ Contract ↔ ContractTenant ↔ Tenant

### Task 7: Tạo Entity - UtilityReading (Chỉ số điện nước)
- [ ] Tạo `UtilityReading` entity:
  - id, roomId, serviceId
  - month, year
  - previousReading (chỉ số cũ)
  - currentReading (chỉ số mới)
  - consumption (số tiêu thụ = mới - cũ)
  - readingDate
  - readBy (userId)
  - images (JSON: ảnh chỉ số)
  - note
  - createdAt, updatedAt
- [ ] Tạo migration cho UtilityReading table
- [ ] Thiết lập quan hệ với Room và Service

### Task 8: Tạo Entity - Maintenance (Bảo trì/Sửa chữa)
- [ ] Tạo `Maintenance` entity:
  - id, roomId
  - title, description
  - type (REPAIR, MAINTENANCE, INSPECTION)
  - priority (LOW, MEDIUM, HIGH, URGENT)
  - status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - reportedBy (tenantId hoặc userId)
  - assignedTo (userId)
  - cost
  - scheduledDate, completedDate
  - images (JSON)
  - note
  - createdAt, updatedAt
- [ ] Tạo migration cho Maintenance table

### Task 9: Tạo Entity - RoomImage (Hình ảnh phòng)
- [ ] Tạo `RoomImage` entity:
  - id, roomId
  - url (đường dẫn file)
  - type (MAIN, GALLERY)
  - caption
  - order
  - createdAt, updatedAt
- [ ] Tạo migration cho RoomImage table

### Task 10: Cập nhật Entity - User (Roles & Permissions)
- [ ] Cập nhật `User` entity thêm:
  - role (ADMIN, MANAGER, STAFF)
  - phone, avatar
  - isActive
  - lastLoginAt
- [ ] Tạo migration để update User table

### Task 11: Seed Data (Dữ liệu mẫu)
- [ ] Tạo seed data cho Services (điện, nước, internet, rác...)
- [ ] Tạo seed data cho Rooms (5-10 phòng mẫu)
- [ ] Tạo seed data cho User admin

---

## 🔌 PHASE 3: BACKEND APIs

### Task 12: Room Management APIs
- [ ] GET `/api/rooms` - Danh sách phòng (filter: status, floor, price range, pagination)
- [ ] GET `/api/rooms/:id` - Chi tiết phòng
- [ ] POST `/api/rooms` - Tạo phòng mới
- [ ] PUT `/api/rooms/:id` - Cập nhật phòng
- [ ] DELETE `/api/rooms/:id` - Xóa phòng
- [ ] GET `/api/rooms/:id/availability` - Kiểm tra phòng trống
- [ ] GET `/api/rooms/:id/services` - Dịch vụ của phòng
- [ ] POST `/api/rooms/:id/services` - Thêm dịch vụ cho phòng
- [ ] DELETE `/api/rooms/:id/services/:serviceId` - Xóa dịch vụ khỏi phòng
- [ ] GET `/api/rooms/statistics` - Thống kê phòng

### Task 13: Tenant Management APIs
- [ ] GET `/api/tenants` - Danh sách người thuê (search, filter, pagination)
- [ ] GET `/api/tenants/:id` - Chi tiết người thuê
- [ ] POST `/api/tenants` - Tạo người thuê mới
- [ ] PUT `/api/tenants/:id` - Cập nhật thông tin
- [ ] DELETE `/api/tenants/:id` - Xóa người thuê
- [ ] GET `/api/tenants/:id/contracts` - Lịch sử hợp đồng
- [ ] GET `/api/tenants/:id/current-room` - Phòng đang thuê

### Task 14: Contract Management APIs
- [ ] GET `/api/contracts` - Danh sách hợp đồng (filter: status, room, tenant)
- [ ] GET `/api/contracts/:id` - Chi tiết hợp đồng
- [ ] POST `/api/contracts` - Tạo hợp đồng mới
- [ ] PUT `/api/contracts/:id` - Cập nhật hợp đồng
- [ ] POST `/api/contracts/:id/activate` - Kích hoạt hợp đồng
- [ ] POST `/api/contracts/:id/terminate` - Chấm dứt hợp đồng
- [ ] POST `/api/contracts/:id/renew` - Gia hạn hợp đồng
- [ ] GET `/api/contracts/active` - Hợp đồng đang hoạt động
- [ ] GET `/api/contracts/expiring` - Hợp đồng sắp hết hạn
- [ ] POST `/api/contracts/:id/tenants` - Thêm người ở cùng
- [ ] DELETE `/api/contracts/:id/tenants/:tenantId` - Xóa người ở cùng

### Task 15: Service Management APIs
- [ ] GET `/api/services` - Danh sách dịch vụ
- [ ] GET `/api/services/:id` - Chi tiết dịch vụ
- [ ] POST `/api/services` - Tạo dịch vụ mới
- [ ] PUT `/api/services/:id` - Cập nhật dịch vụ
- [ ] DELETE `/api/services/:id` - Xóa dịch vụ
- [ ] GET `/api/services/:id/rooms` - Phòng sử dụng dịch vụ

### Task 16: Utility Reading APIs
- [ ] POST `/api/utility-readings` - Ghi chỉ số
- [ ] GET `/api/utility-readings/room/:roomId` - Lịch sử chỉ số theo phòng
- [ ] GET `/api/utility-readings/month/:year/:month` - Chỉ số theo tháng
- [ ] PUT `/api/utility-readings/:id` - Cập nhật chỉ số
- [ ] POST `/api/utility-readings/bulk` - Ghi chỉ số hàng loạt
- [ ] GET `/api/utility-readings/pending` - Phòng chưa ghi chỉ số

### Task 17: Maintenance APIs
- [ ] GET `/api/maintenance` - Danh sách yêu cầu (filter: status, priority, room)
- [ ] GET `/api/maintenance/:id` - Chi tiết yêu cầu
- [ ] POST `/api/maintenance` - Tạo yêu cầu mới
- [ ] PUT `/api/maintenance/:id` - Cập nhật yêu cầu
- [ ] PUT `/api/maintenance/:id/status` - Thay đổi trạng thái
- [ ] DELETE `/api/maintenance/:id` - Xóa yêu cầu
- [ ] GET `/api/maintenance/room/:roomId` - Lịch sử bảo trì phòng

### Task 18: Dashboard & Statistics APIs
- [ ] GET `/api/dashboard/overview` - Tổng quan (số phòng, người thuê, doanh thu)
- [ ] GET `/api/dashboard/occupancy-rate` - Tỷ lệ lấp đầy
- [ ] GET `/api/dashboard/revenue` - Doanh thu (theo tháng, năm)
- [ ] GET `/api/dashboard/room-status` - Trạng thái phòng
- [ ] GET `/api/dashboard/expiring-contracts` - Hợp đồng sắp hết hạn
- [ ] GET `/api/dashboard/maintenance-summary` - Tổng hợp bảo trì

### Task 19: User Management APIs (Admin)
- [ ] GET `/api/users` - Danh sách người dùng
- [ ] GET `/api/users/:id` - Chi tiết người dùng
- [ ] POST `/api/users` - Tạo người dùng
- [ ] PUT `/api/users/:id` - Cập nhật người dùng
- [ ] DELETE `/api/users/:id` - Xóa người dùng
- [ ] PUT `/api/users/:id/toggle-active` - Khóa/Mở khóa tài khoản

---

## 🎨 PHASE 4: FRONTEND UI

### Task 20: Layout & Navigation
- [ ] Thiết kế layout chính với sidebar
- [ ] Header với thông tin user, logout
- [ ] Sidebar navigation menu
- [ ] Breadcrumb
- [ ] Responsive design (mobile, tablet)
- [ ] Loading states & Error boundaries

### Task 21: Dashboard Page
- [ ] Tổng quan: số phòng, số người thuê, doanh thu tháng
- [ ] Biểu đồ tỷ lệ lấp đầy theo tháng
- [ ] Biểu đồ doanh thu
- [ ] Danh sách phòng trống
- [ ] Hợp đồng sắp hết hạn (alert)
- [ ] Yêu cầu bảo trì chưa xử lý
- [ ] Phòng chưa ghi chỉ số tháng này

### Task 22: Room Management UI
- [ ] Trang danh sách phòng (Grid view & List view)
- [ ] Filter: Trạng thái, Tầng, Khoảng giá
- [ ] Search phòng
- [ ] Card phòng hiển thị: ảnh, tên, giá, trạng thái
- [ ] Trang chi tiết phòng
- [ ] Form thêm/sửa phòng
- [ ] Upload & quản lý hình ảnh phòng
- [ ] Quản lý dịch vụ của phòng
- [ ] Lịch sử hợp đồng của phòng
- [ ] Modal xác nhận xóa

### Task 23: Tenant Management UI
- [ ] Trang danh sách người thuê
- [ ] Search & filter người thuê
- [ ] Trang chi tiết người thuê
- [ ] Form thêm/sửa người thuê
- [ ] Hiển thị phòng đang thuê
- [ ] Lịch sử hợp đồng
- [ ] Modal xác nhận xóa

### Task 24: Contract Management UI
- [ ] Trang danh sách hợp đồng
- [ ] Filter: Trạng thái, Phòng, Người thuê
- [ ] Trang chi tiết hợp đồng
- [ ] Form tạo hợp đồng mới (multi-step)
  - Bước 1: Chọn phòng
  - Bước 2: Chọn người thuê chính
  - Bước 3: Thêm người ở cùng
  - Bước 4: Thông tin hợp đồng
  - Bước 5: Xác nhận
- [ ] Form chỉnh sửa hợp đồng
- [ ] Chức năng gia hạn hợp đồng
- [ ] Chức năng chấm dứt hợp đồng
- [ ] Thêm/xóa người ở cùng
- [ ] Print/Export hợp đồng PDF
- [ ] Timeline hợp đồng

### Task 25: Service Management UI
- [ ] Trang danh sách dịch vụ
- [ ] Form thêm/sửa dịch vụ
- [ ] Bật/tắt dịch vụ
- [ ] Danh sách phòng đang dùng dịch vụ
- [ ] Cài đặt giá dịch vụ theo phòng

### Task 26: Utility Reading UI
- [ ] Trang ghi chỉ số điện nước
- [ ] Form ghi chỉ số từng phòng
- [ ] Form ghi chỉ số hàng loạt (bulk entry)
- [ ] Upload ảnh chỉ số
- [ ] Lịch sử chỉ số theo phòng
- [ ] Biểu đồ tiêu thụ điện nước
- [ ] Danh sách phòng chưa ghi chỉ số
- [ ] Export báo cáo chỉ số

### Task 27: Maintenance Management UI
- [ ] Trang danh sách yêu cầu bảo trì
- [ ] Filter: Trạng thái, Độ ưu tiên, Phòng
- [ ] Form tạo yêu cầu bảo trì
- [ ] Chi tiết yêu cầu
- [ ] Cập nhật trạng thái
- [ ] Upload ảnh sự cố
- [ ] Gán nhân viên xử lý
- [ ] Lịch sử bảo trì theo phòng
- [ ] Thống kê chi phí bảo trì

### Task 28: Reports & Export
- [ ] Báo cáo doanh thu theo tháng/năm
- [ ] Báo cáo tỷ lệ lấp đầy
- [ ] Báo cáo tiêu thụ điện nước
- [ ] Báo cáo chi phí bảo trì
- [ ] Export Excel
- [ ] Export PDF
- [ ] Bộ lọc báo cáo (date range, room, tenant...)

### Task 29: User Management UI (Admin)
- [ ] Trang danh sách người dùng
- [ ] Form thêm/sửa người dùng
- [ ] Phân quyền (Admin, Manager, Staff)
- [ ] Khóa/Mở khóa tài khoản
- [ ] Lịch sử hoạt động user

---

## 🔐 PHASE 5: AUTHENTICATION & AUTHORIZATION

### Task 30: Authentication
- [ ] Setup JWT authentication
- [ ] POST `/api/auth/login` - Đăng nhập
- [ ] POST `/api/auth/logout` - Đăng xuất
- [ ] POST `/api/auth/refresh-token` - Refresh token
- [ ] GET `/api/auth/profile` - Thông tin user hiện tại
- [ ] PUT `/api/auth/profile` - Cập nhật profile
- [ ] POST `/api/auth/change-password` - Đổi mật khẩu

### Task 31: Authorization & Role-based Access
- [ ] Middleware kiểm tra authentication
- [ ] Middleware kiểm tra role/permission
- [ ] Protected routes trên frontend
- [ ] Ẩn/hiện chức năng theo role

### Task 32: Login/Logout UI
- [ ] Trang đăng nhập
- [ ] Trang quên mật khẩu (optional)
- [ ] Profile page
- [ ] Change password page

---

## 🚀 PHASE 6: ADVANCED FEATURES

### Task 33: File Upload
- [ ] Setup multer/file storage
- [ ] API upload file
- [ ] Upload ảnh phòng
- [ ] Upload ảnh chỉ số điện nước
- [ ] Upload ảnh bảo trì
- [ ] Upload avatar user

### Task 34: Notifications (Optional)
- [ ] Thông báo hợp đồng sắp hết hạn
- [ ] Thông báo chưa ghi chỉ số
- [ ] Thông báo yêu cầu bảo trì mới

### Task 35: Settings & Configuration
- [ ] Cài đặt thông tin nhà trọ
- [ ] Cài đặt giá điện nước mặc định
- [ ] Cài đặt ngày đóng tiền mặc định
- [ ] Cài đặt email/SMS thông báo (optional)

### Task 36: Audit Log
- [ ] Ghi log các thao tác quan trọng
- [ ] Xem lịch sử thay đổi

---

## ✨ PHASE 7: TESTING & DEPLOYMENT

### Task 37: Testing
- [ ] Unit tests cho services
- [ ] Integration tests cho APIs
- [ ] E2E tests cho UI (optional)
- [ ] Manual testing

### Task 38: Documentation
- [ ] API documentation (Swagger/Postman)
- [ ] User manual
- [ ] Developer documentation

### Task 39: Performance & Optimization
- [ ] Database indexes optimization
- [ ] API caching
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting

### Task 40: Deployment
- [ ] Setup production environment
- [ ] Environment variables
- [ ] Database backup strategy
- [ ] CI/CD pipeline (optional)
- [ ] Monitoring & logging

---

## 📝 NOTES

### Độ ưu tiên triển khai (MVP - Minimum Viable Product)

**SPRINT 1** (2 tuần): Core Data & Room Management
- Tasks: 1-4, 11, 12, 20-22

**SPRINT 2** (2 tuần): Tenant & Contract Management
- Tasks: 5-6, 10, 13-14, 23-24

**SPRINT 3** (2 tuần): Services & Utilities
- Tasks: 7, 15-16, 25-26

**SPRINT 4** (1 tuần): Maintenance & Dashboard
- Tasks: 8, 17-18, 21, 27

**SPRINT 5** (1 tuần): Auth & Polish
- Tasks: 30-32, 33

**SPRINT 6** (1 tuần): Testing & Deployment
- Tasks: 37-40

### Tech Stack
- **Backend**: Node.js, Express, TypeORM, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Auth**: JWT
- **File Storage**: Local/S3
- **Deployment**: Docker, Docker Compose

### Database Design Principles
- Sử dụng migrations thay vì synchronize
- Soft delete cho các entity quan trọng
- Audit fields: createdAt, updatedAt
- Proper indexes cho performance
- Foreign key constraints
