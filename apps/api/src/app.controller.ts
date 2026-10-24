import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getRootDashboard(): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrewLite API – Backend Server Portal</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0ea5e9;
      --accent: #10b981;
      --coffee: #d97706;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px 16px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      font-size: 32px;
      background: rgba(217, 119, 6, 0.2);
      border: 1px solid rgba(217, 119, 6, 0.4);
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }
    .brand-desc {
      font-size: 13px;
      color: var(--text-muted);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }
    .cta-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%);
      padding: 20px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .cta-text h2 {
      font-size: 18px;
      margin-bottom: 4px;
    }
    .cta-text p {
      font-size: 13px;
      opacity: 0.9;
    }
    .btn-web {
      background: #fff;
      color: #0284c7;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.2s;
    }
    .btn-web:hover { transform: translateY(-2px); }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .metric-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .metric-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }
    .section-title {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
    }
    .endpoint-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .endpoint-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .method {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .method-get { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .method-post { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-patch { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .path {
      font-family: monospace;
      font-size: 14px;
      color: #f1f5f9;
      font-weight: 600;
    }
    .endpoint-desc {
      font-size: 12px;
      color: var(--text-muted);
    }
    .btn-test {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border);
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-test:hover { background: rgba(255, 255, 255, 0.18); }
    .test-console {
      background-color: #0b1120;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 12px;
      color: var(--text-muted);
    }
    pre {
      background: transparent;
      color: #38bdf8;
      font-family: monospace;
      font-size: 13px;
      max-height: 250px;
      overflow: auto;
      white-space: pre-wrap;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <div class="brand-icon">☕</div>
        <div>
          <div class="brand-title">BrewLite API Server</div>
          <div class="brand-desc">NestJS Modular Architecture • Assignment 2 (ĐH Sài Gòn)</div>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        API Online & Operational
      </div>
    </header>

    <!-- BANNER CHUYỂN SANG FRONTEND -->
    <div class="cta-banner">
      <div class="cta-text">
        <h2>🌐 Trải nghiệm Giao diện Khách hàng & Quầy</h2>
        <p>Ứng dụng Next.js Mobile-first / PWA kết nối trực tiếp với backend server này.</p>
      </div>
      <a href="https://brewlite-web-nt76.onrender.com" target="_blank" class="btn-web">
        Mở Web App Client ➔
      </a>
    </div>

    <!-- METRICS -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Framework Backend</div>
        <div class="metric-val">NestJS 10.3</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Runtime & Platform</div>
        <div class="metric-val">Node.js 20 / Docker</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Cơ sở dữ liệu</div>
        <div class="metric-val">PostgreSQL / Prisma</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Mã hóa & Xác thực</div>
        <div class="metric-val">JWT (HMAC-SHA256)</div>
      </div>
    </div>

    <!-- DANH SÁCH ENDPOINTS -->
    <div class="section-title">⚡ Danh sách REST Endpoints Trực tuyến</div>
    <div class="endpoints-list">
      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-get">GET</span>
          <div>
            <div class="path">/health</div>
            <div class="endpoint-desc">Kiểm tra trạng thái vận hành máy chủ (Health check)</div>
          </div>
        </div>
        <button class="btn-test" onclick="runTest('/health')">Thử nghiệm ➔</button>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-get">GET</span>
          <div>
            <div class="path">/products</div>
            <div class="endpoint-desc">Danh sách thực đơn kèm Size, Topping và số lượng tồn kho</div>
          </div>
        </div>
        <button class="btn-test" onclick="runTest('/products')">Thử nghiệm ➔</button>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-get">GET</span>
          <div>
            <div class="path">/products/prod-01</div>
            <div class="endpoint-desc">Xem chi tiết sản phẩm theo ID (Trà Sữa Ô Long Nướng)</div>
          </div>
        </div>
        <button class="btn-test" onclick="runTest('/products/prod-01')">Thử nghiệm ➔</button>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-post">POST</span>
          <div>
            <div class="path">/auth/login</div>
            <div class="endpoint-desc">Đăng nhập tài khoản và nhận Token JWT</div>
          </div>
        </div>
        <button class="btn-test" onclick="runLoginTest()">Thử nghiệm Login ➔</button>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-post">POST</span>
          <div>
            <div class="path">/orders/checkout</div>
            <div class="endpoint-desc">Tạo đơn, trừ kho (Transaction) & Thanh toán (Idempotency)</div>
          </div>
        </div>
        <span class="endpoint-desc">Yêu cầu Bearer JWT</span>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-info">
          <span class="method method-patch">PATCH</span>
          <div>
            <div class="path">/orders/:id/status</div>
            <div class="endpoint-desc">Cập nhật trạng thái đơn (PAID -> PREPARING -> COMPLETED)</div>
          </div>
        </div>
        <span class="endpoint-desc">Quầy / Barista API</span>
      </div>
    </div>

    <!-- INTERACTIVE TEST CONSOLE -->
    <div class="section-title">🖥️ Interactive Live API Console</div>
    <div class="test-console">
      <div class="console-header">
        <span id="console-target">Endpoint: /health</span>
        <span id="console-status">HTTP 200 OK</span>
      </div>
      <pre id="console-output">// Bấm nút "Thử nghiệm ➔" ở danh sách trên để xem kết quả phản hồi JSON trực tiếp tại đây...</pre>
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      BrewLite Coffee & Tea • Công nghệ Phần mềm Assignment 2 • Khoa CNTT – ĐH Sài Gòn (2026)
    </footer>
  </div>

  <script>
    async function runTest(endpoint) {
      document.getElementById('console-target').innerText = 'Endpoint: ' + endpoint;
      document.getElementById('console-status').innerText = 'Đang gọi API...';
      document.getElementById('console-output').innerText = 'Loading...';
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        document.getElementById('console-status').innerText = 'HTTP ' + res.status + ' OK';
        document.getElementById('console-output').innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        document.getElementById('console-status').innerText = 'Lỗi kết nối';
        document.getElementById('console-output').innerText = err.toString();
      }
    }

    async function runLoginTest() {
      document.getElementById('console-target').innerText = 'Endpoint: POST /auth/login';
      document.getElementById('console-status').innerText = 'Đang gửi payload login...';
      document.getElementById('console-output').innerText = 'Loading...';
      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'customer@brewlite.vn', password: 'password123' })
        });
        const data = await res.json();
        document.getElementById('console-status').innerText = 'HTTP ' + res.status + ' OK';
        document.getElementById('console-output').innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        document.getElementById('console-status').innerText = 'Lỗi kết nối';
        document.getElementById('console-output').innerText = err.toString();
      }
    }

    // Auto-run health test on load
    window.addEventListener('DOMContentLoaded', () => runTest('/health'));
  </script>
</body>
</html>`;
  }
}

