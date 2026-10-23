# Bối cảnh, Stakeholder và Phạm vi dự án BrewLite

## 1. Bối cảnh và Vấn đề nghiệp vụ

### 1.1. Bối cảnh hiện tại
Tại các cửa hàng đồ uống, quy trình gọi món và thanh toán truyền thống tại quầy thường gặp các vấn đề sau vào giờ cao điểm:
- Khách hàng phải xếp hàng dài chờ đợi, gây ảnh hưởng đến trải nghiệm.
- Nhân viên thu ngân dễ ghi nhận sai các tùy chọn phức tạp của đồ uống (kích cỡ, mức đường, lượng đá, topping)[cite: 6].
- Quá trình thanh toán thủ công mất thời gian và khách hàng không biết chính xác khi nào đồ uống của mình được pha xong.

### 1.2. Giải pháp của BrewLite
**BrewLite** là hệ thống đặt đồ uống trực tuyến được thiết kế theo hướng **Mobile-first / PWA (Progressive Web App)**[cite: 3], giúp số hóa toàn bộ quy trình từ lúc khách hàng xem thực đơn đến khi nhận đồ uống:
- Cung cấp trải nghiệm đặt món chủ động, nhanh chóng và chính xác cho khách hàng ngay trên điện thoại cá nhân.
- Giảm tải áp lực cho nhân viên quầy, tối ưu hóa quy trình tiếp nhận đơn và pha chế.
- Số hóa quá trình thanh toán và quản lý trạng thái đơn hàng theo thời gian thực một cách minh bạch.

---

## 2. Phân tích Stakeholder

| Stakeholder | Vai trò trong hệ thống | Mục tiêu (Goals) | Kỳ vọng đối với hệ thống (Expectations) |
| :--- | :--- | :--- | :--- |
| **Khách hàng (Customer)** | Người dùng cuối đặt mua đồ uống[cite: 3] | Đặt món nhanh chóng, đúng sở thích cá nhân mà không cần xếp hàng. | Giao diện di động mượt mà; chọn được size, topping rõ ràng; thanh toán an toàn; theo dõi được trạng thái đơn hàng[cite: 3, 6]. |
| **Nhân viên quầy (Cashier / Barista)** | Người tiếp nhận đơn và pha chế[cite: 3] | Nhận đơn chính xác, không phải xác nhận lại với khách; thao tác cập nhật đơn nhanh gọn. | Danh sách đơn hiển thị rõ tùy chọn, có giao diện để cập nhật trạng thái đơn (Đang pha $\rightarrow$ Hoàn thành) dễ dàng[cite: 4, 6]. |
| **Quản lý cửa hàng (Store Manager)** | Người quản trị vận hành cửa hàng[cite: 3] | Vận hành trơn tru, kiểm soát được doanh thu và tình trạng tồn kho[cite: 4]. | Hệ thống hoạt động ổn định, theo dõi được lịch sử đơn hàng và quản lý danh mục menu dễ dàng[cite: 4, 6]. |
| **Giảng viên / Khách hàng nghiệm thu** | Người đánh giá và nghiệm thu sản phẩm[cite: 3] | Kiểm chứng quá trình áp dụng kỹ thuật phần mềm vào thực tế[cite: 3]. | Có đầy đủ tài liệu, sơ đồ thiết kế; mã nguồn sạch, có kiểm thử tự động, CI/CD và URL production truy cập được[cite: 3, 7]. |
| **Nhóm phát triển (Development Team)** | Đội ngũ thiết kế, lập trình và vận hành[cite: 3] | Xây dựng hệ thống đạt chuẩn chất lượng, đúng thời hạn và đúng công nghệ yêu cầu[cite: 1, 3]. | Yêu cầu nghiệp vụ rõ ràng, kiến trúc phân tách mạch lạc, tự động hóa được luồng tích hợp và triển khai[cite: 5, 7]. |
| **Đơn vị thanh toán (Payment Service)** | Hệ thống xử lý giao dịch thanh toán (mô phỏng)[cite: 3, 5] | Tiếp nhận và xử lý giao dịch thanh toán của khách hàng một cách an toàn. | Hệ thống gửi yêu cầu thanh toán đúng định dạng, có cơ chế xử lý lỗi và đảm bảo tính toàn vẹn dữ liệu[cite: 4, 5]. |

---

## 3. Phạm vi sản phẩm (Product Scope)

### 3.1. Phạm vi trong MVP (In-Scope)
Hệ thống trong giai đoạn MVP (Sprint 1 & Sprint 2) tập trung hoàn thiện luồng nghiệp vụ cốt lõi từ đầu đến cuối (End-to-End)[cite: 3, 5, 6]:
1. **Thực đơn (Menu) & Sản phẩm:** Xem danh sách đồ uống, chi tiết sản phẩm, tùy chọn kích cỡ (size) và thành phần đi kèm (topping); xử lý các trạng thái tải dữ liệu (`loading`), danh sách trống (`empty`) và lỗi (`error`)[cite: 6].
2. **Giỏ hàng (Cart):** Thêm, sửa, xóa sản phẩm trong giỏ hàng và tự động tính tổng tiền thanh toán[cite: 6].
3. **Xác thực người dùng (Authentication):** Đăng ký, đăng nhập an toàn bằng JWT và quản lý phiên đăng nhập[cite: 4, 6].
4. **Đặt đơn (Order Management):** Tạo đơn hàng, kiểm tra tính hợp lệ của dữ liệu và cập nhật trừ tồn kho[cite: 4, 6].
5. **Thanh toán (Payment):** Hỗ trợ thanh toán trực tuyến qua Ví/Thẻ (sử dụng dịch vụ mô phỏng), đảm bảo an toàn giao dịch[cite: 4, 6].
6. **Theo dõi & Lịch sử đơn hàng (Order Tracking & History):** Xác nhận đơn hàng, xem trạng thái xử lý hiện tại và tra cứu lại lịch sử các đơn đã đặt[cite: 3, 4, 6].

### 3.2. Phạm vi mở rộng (Extended / Future Scope)
Các tính năng đã được tính toán trong mô hình dữ liệu (Domain Model) nhưng sẽ được phát triển ở các phiên bản sau MVP[cite: 3, 5]:
- **Khuyến mãi (`Promotion`):** Áp dụng mã giảm giá, voucher theo điều kiện đơn hàng[cite: 5].
- **Tích điểm thành viên (`LoyaltyTransaction`):** Tích lũy điểm thưởng sau mỗi đơn hàng thành công và dùng điểm để quy đổi ưu đãi[cite: 5].

### 3.3. Ngoài phạm vi (Out-of-Scope)
Các nội dung **không** thực hiện trong dự án này để đảm bảo sự tập trung cho MVP[cite: 3, 4]:
- Không tích hợp cổng thanh toán tài chính thực tế như VNPay, MoMo production (chỉ sử dụng dịch vụ thanh toán mô phỏng)[cite: 5, 6].
- Không quản lý quá trình giao hàng (shipper) hoặc tích hợp với các nền tảng giao hàng bên thứ ba (GrabFood, ShopeeFood).
- Không quản lý định lượng nguyên vật liệu kho chi tiết đến từng gram/ml.
- Không hỗ trợ hệ thống đa chi nhánh.

---

## 4. Giả định, Ràng buộc và Rủi ro ban đầu

### 4.1. Giả định (Assumptions)
- Khách hàng sử dụng thiết bị di động có kết nối Internet và trình duyệt web hiện đại.
- Dịch vụ thanh toán là môi trường mô phỏng (sandbox) luôn phản hồi kết quả theo kịch bản đã được thiết lập sẵn[cite: 5, 6].
- Đơn hàng mặc định là khách hàng tự đến quầy nhận (Pick-up) hoặc dùng tại quán, không bao gồm giao hàng tận nơi.

### 4.2. Ràng buộc (Constraints)
- **Công nghệ bắt buộc:** Frontend sử dụng **Next.js** (Mobile-first/PWA), Backend sử dụng **NestJS**, cơ sở dữ liệu **PostgreSQL** và đóng gói bằng **Docker**[cite: 1, 3].
- **Quy trình:** Phát triển tuần tự qua 5 Task; quản lý mã nguồn và tài liệu trên Git thông qua branch và Pull Request[cite: 3, 6].
- **Chất lượng mã nguồn:** Áp dụng chặt chẽ pipeline CI; Pull Request không được merge nếu các bước kiểm tra lint, test hoặc build bị thất bại[cite: 6].

### 4.3. Rủi ro ban đầu và Biện pháp giảm thiểu (Initial Risks)
| Mã | Mô tả rủi ro | Mức độ | Biện pháp giảm thiểu (Mitigation) |
| :--- | :--- | :---: | :--- |
| **R-01** | Người dùng bấm thanh toán nhiều lần khi mạng chậm dẫn đến tạo nhiều giao dịch trùng lặp. | Cao | Áp dụng cơ chế **Idempotency** tại API thanh toán để đảm bảo mỗi yêu cầu chỉ được xử lý một lần duy nhất[cite: 4]. |
| **R-02** | Xung đột dữ liệu khi nhiều người cùng đặt một sản phẩm dẫn đến vượt quá số lượng tồn kho. | Cao | Sử dụng **Database Transaction** khi tạo đơn và cập nhật tồn kho để đảm bảo tính nhất quán của dữ liệu[cite: 4]. |
| **R-03** | Môi trường Production bị gián đoạn hoặc gặp lỗi nghiêm trọng trong quá trình triển khai phiên bản mới. | Trung bình | Thiết lập **Health check**, chạy kiểm thử tự động (Smoke Test) sau khi deploy và chuẩn bị sẵn phương án **Rollback** trong pipeline CI/CD[cite: 7]. |