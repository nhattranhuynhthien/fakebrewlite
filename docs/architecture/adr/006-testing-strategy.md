# ADR 006: Chiến lược Kiểm thử Đa tầng (Unit, Integration, End-to-End)

- **Người phụ trách:** TV6 (Frontend – Checkout & Orders / QA)
- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24
- **Liên kết yêu cầu:** NFR-04, Issue D-19, Task 5.2

## 1. Bối cảnh (Context)
Dự án có luồng nghiệp vụ phức tạp từ hiển thị danh mục, chọn size/topping, giỏ hàng, xác thực JWT, tạo đơn hàng, trừ tồn kho transaction đến thanh toán idempotency. Để đảm bảo hệ thống không bị lỗi hồi quy (regression) và đủ điều kiện vượt qua cổng chất lượng (Quality Gate) của pipeline CI/CD, nhóm cần một chiến lược kiểm thử tự động toàn diện.

## 2. Quyết định (Decision)
Áp dụng mô hình Kim tự tháp kiểm thử (Test Pyramid) với 3 tầng tự động hóa:
1. **Tầng 1 - Unit Test:**
   - **Frontend:** Kiểm thử 4 trạng thái giao diện menu (`loading`, `empty`, `error`, `ready`), hàm định dạng tiền tệ VND, hàm tính đơn giá từng ly và hàm tính tổng tiền giỏ hàng (`MenuView.spec.ts`).
   - **Backend:** Kiểm thử Controller và Service của Module Products (`products.controller.spec.ts`).
2. **Tầng 2 - Integration Test:**
   - Kiểm thử toàn bộ API đặt đơn và thanh toán (`orders.integration.spec.ts`):
     - `INT-T01`: Chặn `401 Unauthorized` khi thiếu hoặc sai JWT Token.
     - `INT-T02`: Kiểm tra trừ tồn kho an toàn và báo lỗi `409 Conflict` khi hết hàng.
     - `INT-T03`: Kiểm tra cơ chế `Idempotency-Key` (không tạo đơn trùng khi gửi lặp).
     - `INT-T04`: Kiểm tra hoàn trả tồn kho khi thanh toán bị từ chối (`PAYMENT_FAILED`).
3. **Tầng 3 - End-to-End Test (E2E):**
   - Kịch bản hành trình khách hàng toàn diện từ đầu đến cuối (`e2e-flow.spec.ts`):
     - `GET /health` $\rightarrow$ `GET /products` $\rightarrow$ `POST /auth/register` $\rightarrow$ `POST /orders/checkout` $\rightarrow$ `GET /orders` $\rightarrow$ Barista `PATCH /orders/:id/status`.
4. **Tự động hóa trong CI/CD:** Toàn bộ test suite được kích hoạt tự động trên mỗi Pull Request và mỗi lần push lên `main`. Bất kỳ bài test nào thất bại đều lập tức chặn quá trình merge và build container.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** 100% các tính năng quan trọng đều được kiểm chứng tự động trước khi triển khai; tỷ lệ lỗi trên Production xấp xỉ bằng 0.
- **Đánh đổi / Hạn chế:** Thời gian chạy CI pipeline tăng thêm khoảng 30-45 giây cho mỗi lần chạy test; hoàn toàn xứng đáng với độ tin cậy mang lại.
