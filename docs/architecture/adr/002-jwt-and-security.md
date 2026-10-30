# ADR 002: Xác thực Người dùng bằng JSON Web Token (JWT) và Kiểm soát An ninh

- **Người phụ trách:** TV2 (Backend – Auth & User)
- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24
- **Liên kết yêu cầu:** FR-04, NFR-02, Issue D-15

## 1. Bối cảnh (Context)
Hệ thống BrewLite phục vụ ứng dụng di động PWA (Next.js) và REST API (NestJS). Khách hàng cần đăng nhập để đặt đơn, thanh toán và theo dõi lịch sử đơn hàng. Hệ thống cần giải pháp xác thực phi trạng thái (stateless), an toàn, nhẹ và dễ mở rộng khi triển khai trên hạ tầng container (Docker/Render).

## 2. Quyết định (Decision)
1. Sử dụng **JSON Web Token (JWT)** với thuật toán mã hóa `HMAC-SHA256` để quản lý phiên xác thực người dùng.
2. Mật khẩu người dùng được băm an toàn bằng thuật toán mã hóa một chiều kèm salt trước khi lưu vào cơ sở dữ liệu (tuyệt đối không lưu mật khẩu dạng rõ).
3. Sử dụng `JwtAuthGuard` tại NestJS để bảo vệ các endpoint nhạy cảm (`POST /orders/checkout`, `GET /orders`, `PATCH /orders/:id/status`).
4. Không lưu trữ secret trong mã nguồn; `JWT_SECRET` được truyền qua biến môi trường (.env ở local và Platform Secrets trên Render).

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** 
  - Máy chủ API hoàn toàn stateless, không cần lưu session trong RAM/Redis, dễ dàng scale container.
  - Token chứa payload định danh (`userId`, `email`, `role`) giúp trích xuất thông tin người dùng ngay lập tức.
- **Đánh đổi / Hạn chế:**
  - Token đã cấp không thể thu hồi tức thì trước thời hạn hết hạn nếu không dùng blacklist; do đó nhóm đặt thời gian sống token hợp lý (`JWT_EXPIRES_IN=7d`) và bảo mật qua kênh truyền HTTPS.
