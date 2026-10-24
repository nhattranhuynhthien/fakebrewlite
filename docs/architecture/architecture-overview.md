# Thiết kế Kiến trúc Hệ thống BrewLite (Task 3.1)

## 1. Phương pháp Tiếp cận Kiến trúc
Hệ thống **BrewLite** được thiết kế kết hợp giữa **Mô hình C4 (C4 Model - mức System Context & Container)** để định hình tổng thể các dịch vụ và **Kiến trúc Phân lớp theo Mô-đun (Modular Layered Architecture)** bên trong ứng dụng Backend. Toàn bộ mã nguồn và tài liệu được tổ chức theo mô hình **Monorepo**[cite: 5, 8].

### Sơ đồ Kiến trúc Tổng thể (Container Level)
- **Client Tier (Thiết bị người dùng):** Trình duyệt di động / ứng dụng cài đặt dưới dạng **PWA (Progressive Web App)**[cite: 3, 5].
- **Presentation Tier (`apps/web`):** Ứng dụng **Next.js (App Router)** phục vụ giao diện Mobile-first, kết hợp Server-Side Rendering (SSR) cho trang Menu và Client-Side Interaction cho Giỏ hàng/Đặt đơn[cite: 3, 5, 6, 8].
- **Application / API Tier (`apps/api`):** Dịch vụ **NestJS** cung cấp RESTful API, xử lý logic nghiệp vụ, xác thực JWT, kiểm soát Idempotency và điều phối Database Transaction[cite: 4, 5, 8].
- **Data Tier (`PostgreSQL`):** Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu bền vững (Persistent Storage) cho toàn hệ thống[cite: 3, 5].
- **External / Simulated Tier (`Payment Service`):** Module/Dịch vụ mô phỏng cổng thanh toán Ví điện tử và Thẻ ngân hàng[cite: 5, 6].

---

## 2. Chi tiết các Thành phần Kiến trúc Bắt buộc

### 2.1. Frontend: Next.js Mobile-first / PWA (`apps/web`)
- **Thiết kế Mobile-first:** Giao diện tối ưu cho màn hình dọc trên điện thoại, thao tác chạm một tay thuận tiện (thanh điều hướng dưới đáy, bottom-sheet chọn size/topping)[cite: 3, 6].
- **Cấu hình PWA:** Cung cấp tệp `manifest.json` và Service Worker cơ bản để người dùng có thể thêm ứng dụng vào màn hình chính (Add to Home Screen)[cite: 3, 5].
- **Quản lý trạng thái (State Management):** Quản lý trạng thái bất đồng bộ của API với đầy đủ 3 trạng thái bắt buộc: `loading`, `empty`, `error`[cite: 6]; lưu trữ giỏ hàng tại `localStorage` kết hợp đồng bộ khi đặt đơn; đính kèm JWT và sinh mã `Idempotency-Key` (UUID v4) mỗi khi thực hiện thanh toán[cite: 4, 6].

### 2.2. Backend: NestJS theo Module / Domain (`apps/api`)
Backend được chia tách thành các Domain Module độc lập, mỗi module tuân thủ chặt chẽ 3 lớp (Controller $\rightarrow$ Service $\rightarrow$ Data Access/Repository)[cite: 5]:
- **`AuthModule`:** Đăng ký, đăng nhập, băm mật khẩu (`bcrypt`) và cấp/kiểm tra `JWT` thông qua `JwtAuthGuard`[cite: 4, 6].
- **`ProductsModule`:** Cung cấp API `GET /products` và `GET /products/:id`, quản lý thông tin đồ uống, tùy chọn size/topping và số lượng tồn kho[cite: 6].
- **`OrdersModule`:** Xử lý tạo đơn hàng (`POST /orders`), tra cứu lịch sử đơn (`GET /orders`) và cập nhật trạng thái đơn hàng[cite: 4, 6]. Sử dụng **Database Transaction** để khóa bản ghi sản phẩm, kiểm tra và trừ tồn kho an toàn[cite: 4].
- **`PaymentsModule`:** Kiểm tra khóa chống trùng lặp `Idempotency-Key`, kết nối với dịch vụ thanh toán mô phỏng và cập nhật trạng thái đơn hàng/hoàn kho tùy theo kết quả giao dịch[cite: 4, 5, 6].
- **`HealthModule`:** Cung cấp endpoint `GET /health` để kiểm tra tình trạng sống của API và kết nối cơ sở dữ liệu[cite: 5, 7].

### 2.3. Cơ sở dữ liệu PostgreSQL và Cơ chế Migration
- **ORM & Migration:** Sử dụng **Prisma ORM** (hoặc TypeORM) kết nối tới **PostgreSQL**[cite: 3, 5].
- **Quản lý lược đồ (Schema Migration):** Mọi thay đổi cấu trúc bảng (`User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`) đều được lưu thành các tệp migration có kiểm soát phiên bản trong Git[cite: 5, 7, 8].
- **Khởi tạo dữ liệu (Database Seeding):** Cung cấp kịch bản `seed` tự động tạo danh mục đồ uống mẫu và tài khoản thử nghiệm để có thể tái tạo môi trường local/testing bất cứ lúc nào[cite: 6, 7].

### 2.4. Dịch vụ Thanh toán Mô phỏng (Simulated Payment Service)
- Được thiết kế theo mẫu **Adapter Pattern**, cho phép mô phỏng chính xác hành vi của cổng thanh toán thực tế: nhận `amount`, `orderId`, `paymentMethod`, `idempotencyKey`[cite: 4, 5, 6].
- Hỗ trợ giả lập cả kịch bản thanh toán thành công (`SUCCESS`), thất bại do thẻ/ví lỗi (`FAILED`) hoặc độ trễ mạng để phục vụ kiểm thử tích hợp (Integration Test) và End-to-End Test[cite: 4, 5, 7].

### 2.5. Logging, Health Check và Quản lý Cấu hình
- **Logging:** Sử dụng bộ ghi log tích hợp của NestJS (`Logger`) kết hợp interceptor ghi nhận toàn bộ HTTP Request/Response (Method, URL, Status Code, Thời gian xử lý) và stack trace khi có lỗi, đảm bảo **không ghi lộ thông tin nhạy cảm** (mật khẩu, JWT, secret)[cite: 5, 7].
- **Health Check:** Endpoint `GET /health` trả về HTTP `200 OK` kèm trạng thái kết nối Database, được sử dụng bởi Docker healthcheck và bước **Smoke Test** trong pipeline CI/CD sau khi deploy[cite: 5, 7].
- **Quản lý cấu hình (Configuration Management):** Sử dụng `@nestjs/config` đọc biến môi trường từ tệp `.env` ở local và từ CI/Platform Secrets ở môi trường Production[cite: 5, 6, 7]. Tệp `.env.example` cung cấp danh sách các biến mẫu mà không chứa giá trị bí mật[cite: 6, 7, 8].

---

## 3. Lý do lựa chọn, Ưu điểm, Hạn chế và Sự đánh đổi (Trade-offs)

| Tiêu chí | Nội dung phân tích |
| :--- | :--- |
| **Lý do chọn kiến trúc (Rationale)** | 1. **Modular Monolith với NestJS + Next.js trong Monorepo** phù hợp tối ưu với quy mô nhóm sinh viên và phạm vi MVP của BrewLite[cite: 3, 5].<br>2. Đảm bảo dùng chung ngôn ngữ **TypeScript** xuyên suốt từ Frontend đến Backend, giảm thiểu lỗi sai lệch kiểu dữ liệu.<br>3. Dễ dàng đóng gói bằng `docker-compose` ở local và triển khai độc lập từng container lên các nền tảng đám mây (Render / Railway / Vercel)[cite: 5, 7]. |
| **Ưu điểm (Pros)** | - **Phân tách trách nhiệm rõ ràng (Separation of Concerns):** UI, Business Logic và Data Access tách biệt, rất dễ viết Unit Test và Integration Test[cite: 5, 7].<br>- **Tính nhất quán dữ liệu cao (ACID):** Vì dùng chung một cơ sở dữ liệu PostgreSQL, việc áp dụng Database Transaction để vừa tạo đơn vừa trừ tồn kho cực kỳ an toàn, không cần Distributed Transaction phức tạp[cite: 4, 5].<br>- **Tốc độ phát triển & CI/CD nhanh:** Quản lý chung trong 1 repository giúp kiểm soát truy vết từ tài liệu đến code và chạy CI/CD tập trung[cite: 5, 6, 7]. |
| **Hạn chế (Cons)** | - Toàn bộ các module của Backend chạy chung trong một tiến trình (process) NestJS; nếu một module tiêu tốn quá nhiều CPU/RAM có thể ảnh hưởng đến các module khác.<br>- Việc build chung trong Monorepo nếu không cấu hình bộ nhớ đệm (cache) sẽ tốn thời gian hơn khi dự án phình to. |
| **Sự đánh đổi (Trade-offs)** | - **Đánh đổi khả năng mở rộng vi dịch vụ (Microservices) lấy sự đơn giản vận hành (Operational Simplicity):** Thay vì tách rời Order Service, Inventory Service, Payment Service thành các microservice riêng biệt (gây phức tạp về mạng và đồng bộ dữ liệu), nhóm chọn **Modular Monolith** để đảm bảo giao dịch ACID cho tồn kho và hoàn thành đúng tiến độ 2 Sprint[cite: 4, 5, 6].<br>- **Đánh đổi tích hợp cổng thanh toán thật lấy tính ổn định kiểm thử:** Sử dụng dịch vụ thanh toán mô phỏng giúp chủ động kiểm thử 100% các nhánh lỗi (`FAILED`, `Idempotency`) mà không phụ thuộc vào tài khoản ngân hàng thực tế[cite: 4, 5, 6]. |