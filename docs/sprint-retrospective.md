# Biên bản Sprint Review & Sprint Retrospective (Task 5.4)

Dự án: **BrewLite – Hệ thống Đặt Đồ uống Mobile-first / PWA**  
Học phần: **Công nghệ Phần mềm – Assignment 2**  
Nhóm sinh viên thực hiện: Nhóm phát triển BrewLite  

---

## PHẦN 1: SPRINT REVIEW (Đánh giá Sản phẩm bàn giao)

### 1. Mục tiêu Sprint (Sprint Goals)
- **Sprint 1 Goal:** Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản, thiết lập CI và một MVP đầu tiên chạy được cho luồng xem menu đồ uống.
- **Sprint 2 Goal:** Hoàn thành luồng end-to-end (xem menu $\rightarrow$ chọn size/topping $\rightarrow$ giỏ hàng $\rightarrow$ đăng nhập $\rightarrow$ đặt đơn & thanh toán mô phỏng $\rightarrow$ theo dõi đơn hàng), tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được.

### 2. Các tính năng đã hoàn thành và nghiệm thu (Demo Acceptance)
| Hạng mục nghiệm thu | Kết quả thực tế | Trạng thái |
| :--- | :--- | :---: |
| **API Menu & Sản phẩm** | `GET /products`, `GET /products/:id` trả về danh sách đồ uống kèm Size và Topping. |  Đạt |
| **Giao diện Menu Mobile-first** | Next.js 14 responsive trên điện thoại, xử lý 4 trạng thái (`loading`, `empty`, `error`, `ready`). |  Đạt |
| **Tùy chọn Size & Topping** | Modal chọn Size (S/M/L) và Topping tự động cập nhật đơn giá theo thời gian thực. |  Đạt |
| **Quản lý Giỏ hàng** | Thêm món, xóa món, tính tổng tiền tự động. |  Đạt |
| **Xác thực & Bảo mật (JWT)** | Đăng ký, đăng nhập và bảo vệ endpoint bằng JSON Web Token (HMAC-SHA256). |  Đạt |
| **Đặt hàng & Transaction** | Khởi tạo đơn hàng, trừ tồn kho an toàn bằng cơ chế Database Transaction. |  Đạt |
| **Thanh toán mô phỏng & Idempotency** | Hỗ trợ thanh toán qua Ví điện tử / Thẻ, cơ chế `Idempotency-Key` chống thanh toán trùng lặp. |  Đạt |
| **Theo dõi trạng thái & Lịch sử đơn** | Quản lý vòng đời đơn hàng (`PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `COMPLETED`). |  Đạt |
| **Kiểm thử tự động** | 100% các bài Unit Test, Integration Test và E2E Test đều vượt qua (14/14 tests pass). |  Đạt |
| **Đóng gói Docker & Triển khai Cloud** | Chạy đồng bộ qua `docker-compose.yml` ở local và triển khai trực tuyến trên Render Cloud qua HTTPS. |  Đạt |

### 3. Minh chứng Production Live URLs
- **Web App (Next.js):** [https://brewlite-web-nt76.onrender.com](https://brewlite-web-nt76.onrender.com)
- **API Server (NestJS):** [https://brewlite-api-ap0d.onrender.com](https://brewlite-api-ap0d.onrender.com)
- **Health Check Endpoint:** [https://brewlite-api-ap0d.onrender.com/health](https://brewlite-api-ap0d.onrender.com/health)

---

## PHẦN 2: SPRINT RETROSPECTIVE (Cải tiến Quy trình)

### 1. What Went Well (Những điểm làm tốt)
1. **Tuân thủ quy trình phần mềm tuần tự:** Thực hiện bài bản từ Khai thác yêu cầu (Task 1), Mô hình hóa UML (Task 2), Thiết kế kiến trúc & ADR (Task 3) trước khi code, giúp việc triển khai Sprint 1 & 2 không bị sai lệch yêu cầu.
2. **Kiểm thử tự động phủ kín (Quality Gate):** Thiết lập cả Unit test, Integration test và End-to-End test ở cả 2 tầng Frontend và Backend, giúp phát hiện lỗi sớm trước khi merge vào nhánh chính.
3. **Mô hình hóa Monorepo hiệu quả:** Tổ chức code dạng `apps/web` và `apps/api` giúp dùng chung cấu hình và dễ dàng kiểm soát qua 1 repo duy nhất.
4. **Triển khai Production thành công:** Ứng dụng hoạt động ổn định trên Render Cloud với chứng chỉ bảo mật HTTPS hợp lệ.

### 2. What Could Be Improved (Những điểm cần cải tiến)
1. **Quản lý Type definition trong Monorepo:** Khi mở dự án từ thư mục gốc, VS Code đôi khi không tự nhận `@types/node` và `@types/jest` ở các thư mục con nếu không chỉ định rõ `"types"` trong `tsconfig.json`.
2. **Cổng thanh toán thực tế:** Hiện tại mới chỉ mô phỏng thanh toán (Simulated Payment) và Idempotency. Trong tương lai cần tích hợp webhook thực tế từ cổng thanh toán bên thứ ba (VNPay, MoMo hoặc Stripe).
3. **Cơ chế Cache dữ liệu:** Menu đồ uống ít thay đổi, có thể ứng dụng thêm Redis cache để giảm tải truy vấn cơ sở dữ liệu khi lượng người dùng tăng cao.

### 3. Action Items cho các phiên bản tiếp theo
- [ ] Bổ sung thông báo đẩy (Web Push Notification) khi đơn hàng chuyển sang trạng thái "Sẵn sàng nhận đồ uống".
- [ ] Tích hợp giải pháp giám sát log tập trung (như Sentry hoặc Datadog) trên Production.
- [ ] Hoàn thiện phân quyền Role-based Access Control (Admin / Thu ngân / Khách hàng).

