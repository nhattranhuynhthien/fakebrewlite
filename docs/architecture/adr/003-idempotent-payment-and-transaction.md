# ADR 003: Cơ chế Idempotency và Database Transaction trong Đặt đơn & Thanh toán

- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24

## 1. Bối cảnh (Context)
Khi người dùng đặt đồ uống trên thiết bị di động trong điều kiện mạng không ổn định, họ có xu hướng bấm nút "Thanh toán" nhiều lần liên tiếp, hoặc dịch vụ thanh toán có thể phản hồi thất bại sau khi đơn hàng đã được khởi tạo[cite: 4, 5].

## 2. Quyết định (Decision)
1. Bắt buộc sử dụng khóa **`Idempotency-Key`** (lưu kèm ràng buộc `UNIQUE` trong bảng `payments`) cho mọi yêu cầu thanh toán[cite: 4, 5]. Nếu nhận lại khóa cũ, hệ thống trả về kết quả đã xử lý trước đó mà không gọi lại Payment Service[cite: 4].
2. Sử dụng **Database Transaction** để giữ chỗ/trừ tồn kho khi tạo đơn và tự động hoàn lại tồn kho nếu kết quả từ dịch vụ thanh toán mô phỏng trả về thất bại[cite: 4, 5].

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** Ngăn chặn 100% rủi ro trừ tiền hai lần hoặc tạo đơn trùng lặp; đảm bảo số lượng tồn kho luôn chính xác tuyệt đối[cite: 4].
- **Tiêu cực / Đánh đổi:** Tăng thêm một bước truy vấn kiểm tra khóa `Idempotency-Key` và giữ khóa dòng (row lock) ngắn hạn trong cơ sở dữ liệu khi thanh toán[cite: 4].