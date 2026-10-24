# BrewLite – Hệ thống Đặt Đồ uống Mobile-first / PWA

Dự án bài tập lớn môn **Công nghệ Phần mềm** (Assignment 2: Requirements to Deployment) – Trường Đại học Sài Gòn.
- **Công nghệ bắt buộc:** Next.js (Mobile-first/PWA), NestJS, PostgreSQL và Docker.
- **Luồng nghiệp vụ cốt lõi:** Xem menu $\rightarrow$ Chọn tùy chọn (size/topping) $\rightarrow$ Giỏ hàng $\rightarrow$ Đặt đơn $\rightarrow$ Thanh toán $\rightarrow$ Theo dõi đơn.

---

## 🌟 Môi trường Triển khai Production (Live URLs - Task 5.4)

Hệ thống đã được đóng gói containerized và triển khai trực tuyến trên nền tảng **Render Cloud Platform**:

- **🌐 Frontend Web (Next.js PWA Mobile-first):** [https://brewlite-web-nt76.onrender.com](https://brewlite-web-nt76.onrender.com)
- **⚡ Backend API (NestJS REST API):** [https://brewlite-api-ap0d.onrender.com](https://brewlite-api-ap0d.onrender.com)
- **🩺 API Health Check Endpoint:** [https://brewlite-api-ap0d.onrender.com/health](https://brewlite-api-ap0d.onrender.com/health)
- **📋 API Menu Endpoint:** [https://brewlite-api-ap0d.onrender.com/products](https://brewlite-api-ap0d.onrender.com/products)

---

## 1. Cấu trúc Repository (Monorepo)

    brewlite/
    ├── apps/
    │   ├── web/                        # Frontend: Next.js (Mobile-first / PWA)
    │   └── api/                        # Backend: NestJS RESTful API + Prisma ORM
    ├── docs/
    │   ├── requirements/               # Task 1: Context, Scope, SRS, Use-case Spec
    │   ├── diagrams/                   # Task 2: Activity, Sequence, Class, Deployment (.puml & .png)
    │   ├── architecture/               # Task 3: Kiến trúc tổng thể & ADRs
    │   ├── sprint-retrospective.md     # Task 5.4: Biên bản Sprint Review & Retrospective
    │   ├── traceability-matrix.md      # Mục 8: Ma trận truy vết yêu cầu -> thiết kế -> code -> test
    │   └── deployment.md               # Tài liệu triển khai & vận hành
    ├── tests/                          # Kiểm thử tích hợp (Integration) & End-to-End (E2E)
    ├── .github/workflows/              # Pipeline CI/CD tự động (ci.yml & cd.yml)
    ├── docker-compose.yml              # Khởi chạy đồng bộ Web, API, PostgreSQL tại Local
    ├── render.yaml                     # Blueprint cấu hình tự động triển khai Render
    ├── .env.example                    # Mẫu cấu hình biến môi trường
    └── README.md                       # Tài liệu hướng dẫn tổng thể

---

## 2. Quy trình Làm việc & Quản lý Mã nguồn (Task 4.1 & 4.2)

### 2.1. Chiến lược Nhánh (Branching Strategy) & Pull Request
- **`main`:** Nhánh chính chứa mã nguồn ổn định, sẵn sàng triển khai Production. Không push trực tiếp lên `main`.
- **`feat/<ten-tinh-nang>`:** Nhánh phát triển tính năng mới (ví dụ: `feat/sprint1-menu-mvp`, `feat/sprint2-checkout`).
- **`docs/<ten-tai-lieu>`:** Nhánh cập nhật tài liệu yêu cầu, sơ đồ UML hoặc kiến trúc.
- **`fix/<ten-loi>`:** Nhánh sửa lỗi phát sinh.
- **Quy tắc Pull Request (PR):** Mọi thay đổi mã nguồn hoặc tài liệu đều phải tạo Pull Request vào nhánh `main`, ghi rõ lý do thay đổi và bắt buộc vượt qua toàn bộ bước kiểm tra tự động của **CI Pipeline (Install $\rightarrow$ Lint $\rightarrow$ Test $\rightarrow$ Build)** trước khi được merge.

### 2.2. Quy ước Commit (Conventional Commits)
- `feat:` Thêm tính năng mới (VD: `feat(api): add GET /products endpoint`).
- `fix:` Sửa lỗi (VD: `fix(web): handle empty state on menu screen`).
- `docs:` Thêm/cập nhật tài liệu, sơ đồ (VD: `docs: update SRS acceptance criteria`).
- `test:` Thêm hoặc sửa unit/integration/e2e test.
- `ci:` Cấu hình pipeline GitHub Actions hoặc Docker.

### 2.3. Định nghĩa Hoàn thành (Definition of Done - DoD)
Một công việc (Issue / User Story) chỉ được coi là **Done** khi thỏa mãn toàn bộ các điều kiện sau:
1. Mã nguồn được viết sạch, tuân thủ chuẩn linter (`tsc --noEmit`, `eslint`) không có lỗi.
2. Đáp ứng đầy đủ Tiêu chí chấp nhận (Acceptance Criteria) đã định nghĩa trong tài liệu SRS (`docs/requirements/srs.md`).
3. Có xử lý các trạng thái giao diện (`loading`, `empty`, `error`) và validate dữ liệu ở cả Frontend lẫn Backend.
4. Có đầy đủ bài kiểm thử tự động (Unit / Integration / E2E test) tương ứng và tất cả đều vượt qua (PASS).
5. Pipeline CI trên Pull Request chạy xanh (thành công 100%) và đã được cập nhật vào Ma trận truy vết (`docs/traceability-matrix.md`).

---

## 3. Product Backlog (Sprint 1 & Sprint 2)

| Sprint | Mã Issue | Hạng mục công việc (User Story / Task) | Liên kết SRS | Trạng thái |
| :---: | :---: | :--- | :---: | :---: |
| **Sprint 1** | `S1-01` | Thiết lập Monorepo, quy trình Git và đưa tài liệu Task 1–3 vào quản lý phiên bản | `NFR-04` | **Done** |
| **Sprint 1** | `S1-02` | Xây dựng API `GET /products` và `GET /products/:id` kèm dữ liệu mẫu (Seed) | `FR-01`, `FR-02` | **Done** |
| **Sprint 1** | `S1-03` | Xây dựng màn hình Menu Mobile-first bằng Next.js (có trạng thái `loading`, `empty`, `error`) | `FR-01`, `NFR-03` | **Done** |
| **Sprint 1** | `S1-04` | Viết Unit Test cho API/UI Menu và thiết lập GitHub Actions CI (`Install -> Lint -> Test -> Build`) | `FR-01`, `NFR-04` | **Done** |
| **Sprint 2** | `S2-01` | Hiện thực chọn Size/Topping, Giỏ hàng và tính tổng tiền tự động | `FR-02`, `FR-03` | **Done** |
| **Sprint 2** | `S2-02` | Hiện thực Đăng ký, Đăng nhập và bảo vệ API bằng JWT | `FR-04`, `NFR-02` | **Done** |
| **Sprint 2** | `S2-03` | Hiện thực Tạo đơn hàng (Database Transaction trừ tồn kho) và Thanh toán mô phỏng (Idempotency) | `FR-05`, `FR-06` | **Done** |
| **Sprint 2** | `S2-04` | Hiện thực Xác nhận đơn, Theo dõi trạng thái và Xem lịch sử đơn hàng | `FR-07`, `FR-08`, `FR-09` | **Done** |
| **Sprint 2** | `S2-05` | Viết Integration/E2E Test, `GET /health`, `docker-compose.yml` và CD Pipeline deploy lên Production | `NFR-03`, `NFR-04` | **Done** |

---

## 4. Hướng dẫn Chạy Hệ thống ở Local, Test, Build, Deploy và Rollback

### 4.1. Chạy nhanh toàn hệ thống bằng Docker Compose
    cp .env.example .env
    docker compose up --build -d

- **Frontend (Next.js):** `http://localhost:3000`
- **Backend API (NestJS):** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/health`

### 4.2. Chạy Kiểm thử (Test) và Đóng gói (Build) thủ công
    # Tại Backend (apps/api): chạy Unit + Integration + E2E test
    cd apps/api && npm install && npm run lint && npm test && npm run build

    # Tại Frontend (apps/web): chạy UI state + Cart test
    cd apps/web && npm install && npm run lint && npm test && npm run build

### 4.3. Triển khai (Deploy) & Khôi phục khi sự cố (Rollback)
- **Triển khai tự động (CD):** Khi merge PR vào nhánh `main` hoặc đẩy tag phiên bản (`git tag v1.0.0 && git push origin v1.0.0`), workflow `.github/workflows/cd.yml` sẽ tự động:
  1. Chạy Quality Gate (Lint, Test, Build).
  2. Đóng gói Docker Images cho cả Web và API, gắn tag Commit SHA & Latest rồi đẩy lên GHCR (`ghcr.io`).
  3. Kiểm tra an toàn Database Migration.
  4. Kích hoạt Webhook Deploy lên nền tảng Render.
  5. Chạy Smoke Test kiểm tra `/health` và trang chủ.
- **Quy trình Rollback khi lỗi:** Nếu Smoke Test thất bại hoặc phát hiện lỗi nghiêm trọng trên Production:
  1. Render tự động dừng release và giữ nguyên phiên bản hoạt động trước đó.
  2. Nhà phát triển có thể chọn nhanh nút **"Rollback to this version"** trên giao diện Render Dashboard.
  3. Hoặc chạy lệnh `git revert HEAD` rồi push lên nhánh `main` để kích hoạt CD quay về phiên bản ổn định.

---

## 5. Bàn giao & Đánh giá (Task 5.4)
- **Biên bản Sprint Review & Sprint Retrospective:** Xem chi tiết tại [`docs/sprint-retrospective.md`](docs/sprint-retrospective.md).
- **Release Version:** `v1.0.0` (Phiên bản MVP hoàn chỉnh Sprint 1 & 2).
