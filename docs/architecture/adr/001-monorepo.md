# ADR 001: Tổ chức mã nguồn và tài liệu theo kiến trúc Monorepo

- **Trạng thái:** Đã chấp nhận (Accepted)
- **Ngày:** 2026-10-24

## 1. Bối cảnh (Context)
Dự án BrewLite bao gồm ứng dụng Frontend (Next.js), Backend API (NestJS), cơ sở dữ liệu (PostgreSQL), các bài kiểm thử tự động (E2E/Integration) và toàn bộ tài liệu kỹ thuật từ Task 1 đến Task 5[cite: 3, 8]. Nhóm cần một phương án quản lý mã nguồn giúp đồng bộ giữa tài liệu, thiết kế, code và CI/CD pipeline[cite: 3, 6].

## 2. Quyết định (Decision)
Nhóm quyết định sử dụng cấu trúc **Monorepo** chứa toàn bộ thành phần trong một kho mã nguồn Git duy nhất (`apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows`)[cite: 5, 6, 8].

## 3. Hệ quả và Đánh đổi (Consequences & Trade-offs)
- **Tích cực:** Dễ dàng truy vết (traceability) từ yêu cầu SRS, sơ đồ UML đến từng API và bài test trong cùng một Pull Request; chỉ cần duy trì một tệp `docker-compose.yml` và một hệ thống GitHub Actions duy nhất[cite: 6, 7, 8].
- **Tiêu cực / Đánh đổi:** Kích thước repository lớn hơn so với tách repo riêng lẻ; pipeline CI cần cấu hình rõ thư mục làm việc (`working-directory`) cho từng ứng dụng `apps/web` và `apps/api`[cite: 6, 8].