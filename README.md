# BrewLite – Hệ thống Đặt Đồ uống Mobile-first / PWA

Dự án bài tập lớn môn **Công nghệ Phần mềm** (Assignment 2: Requirements to Deployment) – Trường Đại học Sài Gòn[cite: 1].
- **Công nghệ bắt buộc:** Next.js (Mobile-first/PWA), NestJS, PostgreSQL và Docker[cite: 1, 3].
- **Luồng nghiệp vụ cốt lõi:** Xem menu $\rightarrow$ Chọn tùy chọn (size/topping) $\rightarrow$ Giỏ hàng $\rightarrow$ Đặt đơn $\rightarrow$ Thanh toán $\rightarrow$ Theo dõi đơn[cite: 3, 6].

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
    │   ├── traceability-matrix.md      # Mục 8: Ma trận truy vết yêu cầu -> thiết kế -> code -> test
    │   └── deployment.md               # Tài liệu triển khai & vận hành
    ├── tests/                          # Kiểm thử tích hợp (Integration) & End-to-End (E2E)
    ├── .github/workflows/              # Pipeline CI/CD tự động (GitHub Actions)
    ├── docker-compose.yml              # Khởi chạy đồng bộ Web, API, PostgreSQL tại Local
    ├── .env.example                    # Mẫu cấu hình biến môi trường
    └── README.md                       # Tài liệu hướng dẫn tổng thể

---

## 2. Quy trình Làm việc & Quản lý Mã nguồn (Task 4.1 & 4.2)

### 2.1. Chiến lược Nhánh (Branching Strategy) & Pull Request
- **`main`:** Nhánh chính chứa mã nguồn ổn định, sẵn sàng triển khai Production[cite: 6, 7]. Không được push trực tiếp lên `main`.
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
Một công việc (Issue / User Story) chỉ được coi là **Done** khi thỏa mãn toàn bộ các điều kiện sau[cite: 6]:
1. Mã nguồn được viết sạch, tuân thủ chuẩn linter (`eslint`) không có lỗi[cite: 6].
2. Đáp ứng đầy đủ Tiêu chí chấp nhận (Acceptance Criteria) đã định nghĩa trong tài liệu SRS (`docs/requirements/srs.md`)[cite: 4].
3. Có xử lý các trạng thái giao diện (`loading`, `empty`, `error`) và validate dữ liệu ở cả Frontend lẫn Backend[cite: 6].
4. Có đầy đủ bài kiểm thử tự động (Unit / Integration / E2E test) tương ứng và tất cả đều vượt qua (PASS)[cite: 6, 7].
5. Pipeline CI trên Pull Request chạy xanh (thành công 100%) và đã được cập nhật vào Ma trận truy vết (`docs/traceability-matrix.md`)[cite: 6, 7].

---

## 3. Product Backlog (Sprint 1 & Sprint 2)

| Sprint | Mã Issue | Hạng mục công việc (User Story / Task) | Liên kết SRS | Trạng thái |
| :---: | :---: | :--- | :---: | :---: |
| **Sprint 1** | `S1-01` | Thiết lập Monorepo, quy trình Git và đưa tài liệu Task 1–3 vào quản lý phiên bản[cite: 5, 6] | `NFR-04` | Done |
| **Sprint 1** | `S1-02` | Xây dựng API `GET /products` và `GET /products/:id` kèm dữ liệu mẫu (Seed)[cite: 6] | `FR-01`, `FR-02` | In Progress |
| **Sprint 1** | `S1-03` | Xây dựng màn hình Menu Mobile-first bằng Next.js (có trạng thái `loading`, `empty`, `error`)[cite: 6] | `FR-01`, `NFR-03` | In Progress |
| **Sprint 1** | `S1-04` | Viết Unit Test cho API/UI Menu và thiết lập GitHub Actions CI (`Install -> Lint -> Test -> Build`)[cite: 6] | `FR-01`, `NFR-04` | In Progress |
| **Sprint 2** | `S2-01` | Hiện thực chọn Size/Topping, Giỏ hàng và tính tổng tiền tự động[cite: 6] | `FR-02`, `FR-03` | Planned |
| **Sprint 2** | `S2-02` | Hiện thực Đăng ký, Đăng nhập và bảo vệ API bằng JWT[cite: 6] | `FR-04`, `NFR-02` | Planned |
| **Sprint 2** | `S2-03` | Hiện thực Tạo đơn hàng (Database Transaction trừ tồn kho) và Thanh toán mô phỏng (Idempotency)[cite: 4, 6] | `FR-05`, `FR-06` | Planned |
| **Sprint 2** | `S2-04` | Hiện thực Xác nhận đơn, Theo dõi trạng thái và Xem lịch sử đơn hàng[cite: 6] | `FR-07`, `FR-08`, `FR-09` | Planned |
| **Sprint 2** | `S2-05` | Viết Integration/E2E Test, `GET /health`, `docker-compose.yml` và CD Pipeline deploy lên Production[cite: 7] | `NFR-03`, `NFR-04` | Planned |

---

## 4. Hướng dẫn Chạy Hệ thống ở Local, Test, Build, Deploy và Rollback

### 4.1. Chạy nhanh toàn hệ thống bằng Docker Compose
    cp .env.example .env
    docker compose up --build -d

- **Frontend (Next.js):** `http://localhost:3000`
- **Backend API (NestJS):** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/health`[cite: 7]

### 4.2. Chạy Kiểm thử (Test) và Đóng gói (Build) thủ công
    # Tại Backend (apps/api)
    cd apps/api && npm install && npm run lint && npm test && npm run build

    # Tại Frontend (apps/web)
    cd apps/web && npm install && npm run lint && npm test && npm run build

### 4.3. Triển khai (Deploy) & Khôi phục khi sự cố (Rollback)
- **Triển khai tự động:** Khi merge PR vào nhánh `main` hoặc đẩy tag phiên bản (`git tag v1.0.0 && git push origin v1.0.0`), workflow CD sẽ tự động kiểm thử, build Docker Image, đẩy lên GHCR, chạy migration, deploy lên Production và gọi Smoke Test (`GET /health`)[cite: 7].
- **Quy trình Rollback khi lỗi:** Nếu Smoke Test thất bại hoặc phát hiện lỗi trên Production, thực hiện rollback về image tag ổn định liền trước trên nền tảng Render hoặc chạy lệnh revert commit trên nhánh `main` để kích hoạt lại CD về phiên bản an toàn[cite: 7].