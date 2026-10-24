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
  <title>BrewLite API – Developer Platform & Live Console</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(18, 24, 38, 0.85);
      --card-border: rgba(56, 189, 248, 0.15);
      --card-hover: rgba(56, 189, 248, 0.25);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-glow: rgba(56, 189, 248, 0.35);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.3);
      --warning: #f59e0b;
      --code-bg: #060911;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(217, 119, 6, 0.08) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text);
      line-height: 1.5;
      padding: 32px 16px;
      min-height: 100vh;
    }
    .container {
      max-width: 1020px;
      margin: 0 auto;
    }

    /* TOP BAR */
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 4px 20px rgba(217, 119, 6, 0.4);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .live-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 12px;
      font-weight: 700;
    }
    .live-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* HERO QUICK ACTION BANNER */
    .hero-banner {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(14, 116, 144, 0.5) 100%);
      border: 1px solid rgba(56, 189, 248, 0.3);
      backdrop-filter: blur(12px);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .hero-info h2 {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .hero-info p {
      font-size: 13px;
      color: #cbd5e1;
    }
    .hero-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn-portal {
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 10px 18px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn-portal-client {
      background: #fff;
      color: #0369a1;
      box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
    }
    .btn-portal-client:hover { transform: translateY(-2px); }
    .btn-portal-pos {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .btn-portal-pos:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

    /* SYSTEM METRICS GRID */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px 18px;
      backdrop-filter: blur(8px);
    }
    .metric-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
    }
    .metric-extra {
      font-size: 11px;
      color: #38bdf8;
      margin-top: 4px;
    }

    /* SECTION TITLE */
    .section-title {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #94a3b8;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* INTERACTIVE ENDPOINTS LIST */
    .endpoints-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 28px;
    }
    .ep-card {
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      transition: all 0.2s ease;
    }
    .ep-card:hover {
      border-color: var(--card-hover);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .ep-meta {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge-method {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
      min-width: 58px;
      text-align: center;
    }
    .get { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .post { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .patch { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .ep-path {
      font-family: ui-monospace, Menlo, Monaco, monospace;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    .ep-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .ep-actions {
      display: flex;
      gap: 8px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .btn-run {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border: none;
      box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);
    }
    .btn-run:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
    }

    /* LIVE PLAYGROUND CONSOLE */
    .playground-box {
      background: var(--code-bg);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .playground-header {
      background: #111827;
      padding: 12px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pg-title {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pg-status {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .pg-body {
      padding: 16px;
    }
    pre {
      font-family: ui-monospace, Menlo, Monaco, monospace;
      font-size: 13px;
      color: #7dd3fc;
      max-height: 280px;
      overflow: auto;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    /* FOOTER */
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- TOP NAVIGATION & STATUS -->
    <header class="topbar">
      <div class="brand-group">
        <div class="brand-logo">☕</div>
        <div>
          <h1 class="brand-title">BrewLite API Platform</h1>
          <p class="brand-sub">Production RESTful Engine • NestJS 10 • Dockerized</p>
        </div>
      </div>

      <div class="top-actions">
        <div class="live-status">
          <span class="live-dot"></span>
          <span>100% OPERATIONAL</span>
        </div>
        <span style="font-size: 12px; color: var(--text-muted); font-family: monospace;" id="uptime-clock">
          Uptime: Live
        </span>
      </div>
    </header>

    <!-- CALL TO ACTION BANNER -->
    <div class="hero-banner">
      <div class="hero-info">
        <h2>🚀 Cổng Truy Cập Hệ Thống Toàn Diện</h2>
        <p>Hệ thống hỗ trợ cả trải nghiệm khách hàng và màn hình dành cho nhân viên pha chế.</p>
      </div>
      <div class="hero-links">
        <a href="https://brewlite-web-nt76.onrender.com" target="_blank" class="btn-portal btn-portal-client">
          📱 Ứng dụng Khách Hàng (PWA)
        </a>
        <a href="https://brewlite-web-nt76.onrender.com/pos" target="_blank" class="btn-portal btn-portal-pos">
          🏪 Màn hình Quầy Barista (/pos)
        </a>
      </div>
    </div>

    <!-- SYSTEM METRICS OVERVIEW -->
    <div class="section-title">📊 Trạng Thái Máy Chủ & Kiến Trúc</div>
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-tag">Backend Framework</div>
        <div class="metric-val">NestJS 10.3</div>
        <div class="metric-extra">TypeScript • Modular Monolith</div>
      </div>

      <div class="metric-card">
        <div class="metric-tag">Database & ORM</div>
        <div class="metric-val">PostgreSQL 16</div>
        <div class="metric-extra">Prisma ORM • Migration Ready</div>
      </div>

      <div class="metric-card">
        <div class="metric-tag">Bảo Mật & Auth</div>
        <div class="metric-val">JWT Tokens</div>
        <div class="metric-extra">HMAC-SHA256 • CORS Enabled</div>
      </div>

      <div class="metric-card">
        <div class="metric-tag">Cơ Chế Đặt Hàng</div>
        <div class="metric-val">Idempotency</div>
        <div class="metric-extra">Database Transaction trừ kho</div>
      </div>
    </div>

    <!-- LIVE REST API ENDPOINTS -->
    <div class="section-title">⚡ Danh Sách REST Endpoints (Interactive Explorer)</div>
    <div class="endpoints-container">
      <!-- EP 1: HEALTH -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method get">GET</span>
          <div>
            <div class="ep-path">/health</div>
            <div class="ep-desc">Kiểm tra trạng thái vận hành máy chủ (Health Diagnostics)</div>
          </div>
        </div>
        <div class="ep-actions">
          <button class="btn-action btn-run" onclick="executeApi('/health')">▶ Chạy Test</button>
        </div>
      </div>

      <!-- EP 2: PRODUCTS -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method get">GET</span>
          <div>
            <div class="ep-path">/products</div>
            <div class="ep-desc">Danh sách thực đơn kèm Size, Topping và số lượng tồn kho</div>
          </div>
        </div>
        <div class="ep-actions">
          <button class="btn-action btn-run" onclick="executeApi('/products')">▶ Chạy Test</button>
        </div>
      </div>

      <!-- EP 3: PRODUCT DETAIL -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method get">GET</span>
          <div>
            <div class="ep-path">/products/prod-01</div>
            <div class="ep-desc">Chi tiết món theo ID (Trà Sữa Ô Long Nướng)</div>
          </div>
        </div>
        <div class="ep-actions">
          <button class="btn-action btn-run" onclick="executeApi('/products/prod-01')">▶ Chạy Test</button>
        </div>
      </div>

      <!-- EP 4: LOGIN -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method post">POST</span>
          <div>
            <div class="ep-path">/auth/login</div>
            <div class="ep-desc">Đăng nhập tài khoản và cấp Access Token (JWT)</div>
          </div>
        </div>
        <div class="ep-actions">
          <button class="btn-action btn-run" onclick="executeLogin()">▶ Test Đăng Nhập</button>
        </div>
      </div>

      <!-- EP 5: ORDERS -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method post">POST</span>
          <div>
            <div class="ep-path">/orders/checkout</div>
            <div class="ep-desc">Đặt đơn hàng, trừ kho Transaction và thanh toán Idempotency</div>
          </div>
        </div>
        <span style="font-size: 12px; color: var(--text-muted);">Yêu cầu Bearer Token</span>
      </div>

      <!-- EP 6: STATUS -->
      <div class="ep-card">
        <div class="ep-meta">
          <span class="badge-method patch">PATCH</span>
          <div>
            <div class="ep-path">/orders/:id/status</div>
            <div class="ep-desc">Quầy POS cập nhật trạng thái đơn (PAID -> PREPARING -> COMPLETED)</div>
          </div>
        </div>
        <span style="font-size: 12px; color: var(--text-muted);">Barista Action</span>
      </div>
    </div>

    <!-- INTERACTIVE PLAYGROUND RESPONSE CONSOLE -->
    <div class="section-title">🖥️ Interactive Live API Console</div>
    <div class="playground-box">
      <div class="playground-header">
        <div class="pg-title">
          <span>CONSOLE RESPONSE</span>
          <span id="target-display" style="color: #fff;">GET /health</span>
        </div>
        <div class="pg-status" id="status-display">HTTP 200 OK</div>
      </div>
      <div class="pg-body">
        <pre id="output-display">// Bấm "▶ Chạy Test" tại bất kỳ Endpoint nào ở trên để xem phản hồi JSON tại đây...</pre>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      BrewLite Coffee & Tea • Assignment 2: Requirements to Deployment • Khoa CNTT – ĐH Sài Gòn (2026)
    </footer>
  </div>

  <script>
    async function executeApi(endpoint) {
      const targetDisp = document.getElementById('target-display');
      const statusDisp = document.getElementById('status-display');
      const outputDisp = document.getElementById('output-display');

      targetDisp.innerText = 'GET ' + endpoint;
      statusDisp.innerText = 'Calling API...';
      outputDisp.innerText = 'Loading live response...';

      const t0 = performance.now();
      try {
        const res = await fetch(endpoint);
        const t1 = performance.now();
        const duration = Math.round(t1 - t0);
        const data = await res.json();

        statusDisp.innerText = 'HTTP ' + res.status + ' OK (' + duration + 'ms)';
        statusDisp.style.color = '#34d399';
        statusDisp.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        outputDisp.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusDisp.innerText = 'Network Error';
        statusDisp.style.color = '#f87171';
        outputDisp.innerText = err.toString();
      }
    }

    async function executeLogin() {
      const targetDisp = document.getElementById('target-display');
      const statusDisp = document.getElementById('status-display');
      const outputDisp = document.getElementById('output-display');

      targetDisp.innerText = 'POST /auth/login';
      statusDisp.innerText = 'Sending payload...';
      outputDisp.innerText = 'Authenticating...';

      const t0 = performance.now();
      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'customer@brewlite.vn',
            password: 'password123'
          })
        });
        const t1 = performance.now();
        const duration = Math.round(t1 - t0);
        const data = await res.json();

        statusDisp.innerText = 'HTTP ' + res.status + ' OK (' + duration + 'ms)';
        outputDisp.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusDisp.innerText = 'Error';
        outputDisp.innerText = err.toString();
      }
    }

    // Tự động chạy test /health khi trang load xong
    window.addEventListener('DOMContentLoaded', () => {
      executeApi('/health');
    });
  </script>
</body>
</html>`;
  }
}
