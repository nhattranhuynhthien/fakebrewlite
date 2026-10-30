# ADR 005: Kiến trúc Frontend Next.js Mobile-first / PWA và Quản lý Trạng thái Giỏ hàng

- **Người phụ trách:** TV5 (Frontend – Menu & Cart)
- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24
- **Liên kết yêu cầu:** FR-01, FR-02, FR-03, NFR-03, Issue D-18

## 1. Bối cảnh (Context)
Khách hàng mua đồ uống chủ yếu thao tác trên điện thoại thông minh (smartphone). Trải nghiệm người dùng yêu cầu phải nhanh, mượt mà, hỗ trợ cài đặt icon lên màn hình chính (PWA), xử lý tốt khi mất mạng ngắn hạn và đồng bộ giỏ hàng theo thời gian thực khi tùy chọn size, topping.

## 2. Quyết định (Decision)
1. Sử dụng **Next.js 14 (App Router)** với triết lý thiết kế **Mobile-first Responsive**:
   - Tối ưu giao diện cho màn hình di động dọc, đồng thời hiển thị lưới linh hoạt (Responsive Grid) trên PC/Laptop.
2. Cung cấp đầy đủ tệp cấu hình **PWA** (`manifest.json`, icon, metadata) cho phép người dùng "Add to Home Screen".
3. Xử lý triệt để 4 trạng thái giao diện Menu: `loading` (đang tải), `empty` (thực đơn rỗng), `error` (lỗi mạng) và `ready` (hiển thị danh sách).
4. **Quản lý Giỏ hàng (Cart State):**
   - Quản lý trạng thái giỏ hàng phía Client qua React State và đồng bộ `localStorage`.
   - Khóa định danh từng món trong giỏ bằng tổ hợp: `productId + size + toppings + note` để phân biệt chính xác từng ly đồ uống được tùy chỉnh riêng.
   - Tính toán tổng tiền theo thời gian thực: `(Đơn giá gốc + Phụ phí Size + Tổng giá Topping) * Số lượng`.

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** Giao diện phản hồi tức thì mà không cần tải lại trang; người dùng không bị mất giỏ hàng khi lỡ tay làm mới (refresh) trình duyệt.
- **Đánh đổi / Hạn chế:** Việc tính giá ở Client chỉ phục vụ hiển thị; khi submit thanh toán, Backend luôn tính toán lại để ngăn chặn việc người dùng chỉnh sửa giá qua DevTools.
