# ADR 002: Kiến trúc Phân lớp theo Module (Modular Layered Architecture) cho NestJS

- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24

## 1. Bối cảnh (Context)
Hệ thống Backend phải xử lý nhiều miền nghiệp vụ có liên kết chặt chẽ: xác thực người dùng, quản lý sản phẩm/tồn kho, đặt đơn hàng, thanh toán và tích điểm[cite: 4, 5, 6]. Nhóm cần một kiến trúc dễ bảo trì, dễ viết Unit Test và đảm bảo an toàn giao dịch dữ liệu (ACID)[cite: 4, 5, 7].

## 2. Quyết định (Decision)
Xây dựng Backend NestJS theo kiến trúc **Modular Monolith kết hợp Layered Architecture** (Controller $\rightarrow$ Service $\rightarrow$ Repository/ORM) kết nối chung vào một cơ sở dữ liệu PostgreSQL[cite: 3, 5].

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** Có thể sử dụng trực tiếp **Database Transaction** của PostgreSQL để xử lý đồng thời việc tạo đơn hàng và trừ tồn kho một cách nguyên tử (atomic), tránh lỗi bán vượt số lượng tồn kho (overselling)[cite: 4, 5]. Việc mock lớp Service/Repository để chạy Unit Test rất thuận tiện[cite: 6, 7].
- **Tiêu cực / Đánh đổi:** Chưa thể mở rộng (scale) độc lập từng module nhỏ như Microservices, nhưng hoàn toàn đáp ứng vượt mức tải của phạm vi MVP[cite: 3, 5].