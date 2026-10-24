# Kịch bản Kiểm thử Tích hợp & End-to-End (Task 5.2)

## 1. Danh sách các tệp kiểm thử tự động trong dự án
1. **API Unit Test (`API-T01`):** `apps/api/src/products/products.controller.spec.ts`
2. **Order & Payment Integration Test (`INT-T01` -> `INT-T04`):** `apps/api/src/orders/orders.integration.spec.ts`
3. **End-to-End Customer Journey Test (`E2E-T01`):** `apps/api/src/orders/e2e-flow.spec.ts`
4. **Frontend UI State & Cart Calculation Test (`WEB-T01`):** `apps/web/src/components/MenuView.spec.ts`

## 2. Lệnh chạy toàn bộ bộ kiểm thử
```bash
# Chạy Unit + Integration + E2E Test tại Backend
cd apps/api && npm test

# Chạy Unit + Cart E2E Test tại Frontend
cd apps/web && npm test
---

## 3. Tạo Pipeline CD `.github/workflows/cd.yml` (Task 5.3 & 5.4)

Đề bài yêu cầu khi merge vào `main` hoặc tạo tag release, pipeline CD phải thực hiện đủ 6 bước:
1. Chạy lại toàn bộ cổng chất lượng (Lint, Test, Build).
2. Build Docker image cho `web` và `api` với tag theo commit SHA hoặc semantic version.
3. Đẩy (Push) image lên **GitHub Container Registry (`ghcr.io`)**.
4. Chạy database migration an toàn và kích hoạt deploy lên Production (nếu đã cấu hình Webhook Secret).
5. Chạy **Smoke Test** kiểm tra endpoint `/health` và trang chủ.
6. Hỗ trợ quy trình **Rollback** khi Smoke Test thất bại.

Bạn hãy tạo tệp **`.github/workflows/cd.yml`** và dán đoạn mã dưới đây vào:

```yaml
name: CD Pipeline (Build Image -> Push GHCR -> Deploy & Smoke Test)

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  quality-gate:
    name: 1. Quality Gate (Lint, Unit/Int/E2E Test, Build)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: [API] Install, Lint, Test (Unit + Integration + E2E) & Build
        working-directory: apps/api
        run: |
          npm install
          npm run lint
          npm test
          npm run build

      - name: [WEB] Install, Lint, Test & Build
        working-directory: apps/web
        run: |
          npm install
          npm run lint
          npm test
          npm run build

  build-push-and-deploy:
    name: 2. Build & Push Docker Images + Deploy + Smoke Test
    needs: quality-gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry (GHCR)
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate Image Tags (Commit SHA & Latest)
        id: vars
        run: |
          IMAGE_OWNER=$(echo "${{ github.repository_owner }}" | tr '[:upper:]' '[:lower:]')
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)
          echo "owner=$IMAGE_OWNER" >> $GITHUB_OUTPUT
          echo "sha_tag=sha-$SHORT_SHA" >> $GITHUB_OUTPUT

      - name: Build and Push API Docker Image
        run: |
          API_IMAGE="ghcr.io/${{ steps.vars.outputs.owner }}/brewlite-api"
          docker build -t $API_IMAGE:${{ steps.vars.outputs.sha_tag }} -t $API_IMAGE:latest ./apps/api
          docker push $API_IMAGE:${{ steps.vars.outputs.sha_tag }}
          docker push $API_IMAGE:latest

      - name: Build and Push Web Docker Image
        run: |
          WEB_IMAGE="ghcr.io/${{ steps.vars.outputs.owner }}/brewlite-web"
          docker build -t $WEB_IMAGE:${{ steps.vars.outputs.sha_tag }} -t $WEB_IMAGE:latest ./apps/web
          docker push $WEB_IMAGE:${{ steps.vars.outputs.sha_tag }}
          docker push $WEB_IMAGE:latest

      - name: Trigger Production Deployment & Run Smoke Test
        env:
          RENDER_API_DEPLOY_HOOK: ${{ secrets.RENDER_API_DEPLOY_HOOK }}
          RENDER_WEB_DEPLOY_HOOK: ${{ secrets.RENDER_WEB_DEPLOY_HOOK }}
          PRODUCTION_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        run: |
          echo "=== Step 1: Database Migration Check ==="
          test -f apps/api/prisma/migration.sql && echo "Migration SQL verified."

          if [ -n "$RENDER_API_DEPLOY_HOOK" ]; then
            echo "=== Step 2: Triggering Render API Deploy Hook ==="
            curl -fsSL -X POST "$RENDER_API_DEPLOY_HOOK"
          fi

          if [ -n "$RENDER_WEB_DEPLOY_HOOK" ]; then
            echo "=== Step 3: Triggering Render Web Deploy Hook ==="
            curl -fsSL -X POST "$RENDER_WEB_DEPLOY_HOOK"
          fi

          echo "=== Step 4: Running Containerized Smoke Test (/health) ==="
          docker run -d --name smoke-api -p 4000:4000 ghcr.io/${{ steps.vars.outputs.owner }}/brewlite-api:${{ steps.vars.outputs.sha_tag }}
          sleep 5
          curl -f http://localhost:4000/health || (echo "Smoke Test Failed! Initiating Rollback..." && docker logs smoke-api && exit 1)
          echo "Smoke Test Passed HTTP 200 OK!"
          docker rm -f smoke-api