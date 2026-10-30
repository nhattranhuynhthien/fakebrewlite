# ADR 004: Quản lý Giao dịch Đơn hàng (Database Transaction) và Thanh toán Idempotency

- **Người phụ trách:** TV4 (Backend – Order & Payment)
- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24
- **Liên kết yêu cầu:** FR-05, FR-06, NFR-02, Issue D-17

## 1. Bối cảnh (Context)
Trong môi trường bán lẻ F&B trực tuyến, hai rủi ro lớn nhất là:
1. **Bán vượt số lượng tồn kho (Overselling):** Khi nhiều khách hàng cùng bấm đặt một món chỉ còn 1 ly tồn kho vào cùng một thời điểm.
2. **Thanh toán trùng lặp (Double Payment):** Khi mạng chậm, người dùng bấm nút thanh toán nhiều lần liên tiếp hoặc ứng dụng gửi lại request tự động.

## 2. Quyết định (Decision)
1. **Database Transaction:** Áp dụng cơ chế giao dịch ACID của PostgreSQL (`$transaction` / `BEGIN ... COMMIT`) khi tạo đơn hàng:
   - Khóa bản ghi sản phẩm và kiểm tra số lượng tồn kho (`SELECT ... FOR UPDATE`).
   - Nếu không đủ hàng: `ROLLBACK` ngay lập tức và trả lỗi `409 Conflict`.
   - Nếu đủ hàng: trừ tồn kho và tạo đơn ở trạng thái `PENDING`.
2. **Idempotency-Key:** Bắt buộc gửi tiêu đề `Idempotency-Key` (chuỗi UUID duy nhất do Client tạo) trong mỗi request thanh toán.
   - Bảng `payments` lưu khóa này với ràng buộc `UNIQUE`.
   - Khi phát hiện trùng khóa, hệ thống trả về ngay kết quả giao dịch trước đó mà không xử lý lại, ngăn ngừa trừ tiền hai lần.
3. **Cơ chế Hoàn kho (Compensating Transaction):** Nếu dịch vụ thanh toán mô phỏng phản hồi `FAILED`, hệ thống tự động cộng hoàn trả số lượng tồn kho về cho sản phẩm.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** Đảm bảo toàn vẹn dữ liệu 100%, không bị sai lệch kho và không bị trừ tiền kép.
- **Đánh đổi / Hạn chế:** Việc khóa dòng ngắn hạn có thể làm chậm giao dịch đôi chút khi lượng truy cập cực lớn; tuy nhiên hoàn toàn tối ưu cho phạm vi quy mô MVP của cửa hàng.
