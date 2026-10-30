# ADR 003: Cơ chế ORM, Lược đồ Dữ liệu và Migration cho Danh mục Đồ uống (Catalog)

- **Người phụ trách:** TV3 (Backend – Catalog)
- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24
- **Liên kết yêu cầu:** FR-01, FR-02, NFR-04, Issue D-16

## 1. Bối cảnh (Context)
Dự án BrewLite sử dụng cơ sở dữ liệu quan hệ PostgreSQL 16. Danh mục sản phẩm bao gồm các thực thể: Đồ uống (`Product`), Tùy chọn Kích cỡ (`SizeOption`), Topping (`ToppingOption`), cùng các trường quản lý giá và tồn kho (`stock`). Nhóm cần một công cụ quản lý cơ sở dữ liệu có khả năng sinh mã an toàn kiểu (type-safe), kiểm soát phiên bản lược đồ bằng migration và hỗ trợ khởi tạo dữ liệu mẫu (seeding) tự động.

## 2. Quyết định (Decision)
1. Sử dụng **Prisma ORM** kết hợp PostgreSQL 16.
2. Quản lý toàn bộ cấu trúc bảng thông qua tệp lược đồ `prisma/schema.prisma`.
3. Mọi thay đổi về cấu trúc bảng bắt buộc phải tạo tệp migration có kiểm soát phiên bản (`prisma/migrations/`), cho phép tái tạo database trắng thành database đầy đủ chỉ bằng 1 lệnh `npx prisma migrate deploy`.
4. Cung cấp kịch bản Seeding tự động (`seed.ts` / script SQL) để nạp danh mục trà sữa, cà phê muối, trà trái cây kèm đầy đủ size và topping vào DB.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:**
  - Type-safe Client giúp phát hiện lỗi truy vấn ngay khi biên dịch (compile-time).
  - Tự động hóa hoàn toàn việc đồng bộ schema giữa môi trường Local và Production trong pipeline CI/CD.
- **Đánh đổi / Hạn chế:**
  - Thêm một bước sinh mã (`prisma generate`) trong quá trình build container. Đã được giải quyết triệt để trong `Dockerfile` đa tầng.
