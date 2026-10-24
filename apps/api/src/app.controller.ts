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
  <title>BrewLite API – Cyber Dark Terminal & API Explorer</title>
  <style>
    :root {
      --bg: #090a0f;
      --card-bg: rgba(13, 17, 23, 0.92);
      --card-border: rgba(6, 182, 212, 0.22);
      --card-hover: rgba(6, 182, 212, 0.45);
      --neon-cyan: #06b6d4;
      --neon-emerald: #10b981;
      --neon-amber: #f59e0b;
      --neon-rose: #f43f5e;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --code-bg: #04060a;
      --font-mono: ui-monospace, "SF Mono", "Fira Code", Menlo, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      background-image: 
        linear-gradient(rgba(6, 182, 212, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px),
        radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 45%);
      background-size: 32px 32px, 32px 32px, 100% 100%, 100% 100%;
      color: var(--text);
      line-height: 1.5;
      padding: 32px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
    }

    /* TERMINAL TOPBAR */
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 22px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-meta {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .terminal-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #083344 0%, #06b6d4 100%);
      border: 1px solid rgba(6, 182, 212, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.35);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      font-family: var(--font-mono);
      background: linear-gradient(to right, #ffffff, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cursor-blink {
      display: inline-block;
      width: 8px;
      height: 15px;
      background: var(--neon-cyan);
      animation: blink 1s infinite;
      vertical-align: middle;
    }
    @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }

    .top-chips {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-mono);
    }
    .chip-live {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.2);
    }
    .chip-live .dot {
      width: 7px;
      height: 7px;
      background: var(--neon-emerald);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--neon-emerald);
      animation: livePulse 2s infinite;
    }
    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .chip-mono {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }

    /* CYBER HERO BANNER */
    .hero-banner {
      background: linear-gradient(135deg, rgba(8, 51, 68, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(6, 182, 212, 0.35);
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .hero-text h2 {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hero-text p {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-cyber {
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-family: var(--font-mono);
    }
    .btn-cyber-primary {
      background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
      color: #04060a;
      font-weight: 800;
      box-shadow: 0 4px 16px rgba(6, 182, 212, 0.4);
    }
    .btn-cyber-primary:hover {
      box-shadow: 0 6px 22px rgba(6, 182, 212, 0.6);
      transform: translateY(-2px);
    }
    .btn-cyber-secondary {
      background: rgba(15, 23, 42, 0.8);
      color: #38bdf8;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }
    .btn-cyber-secondary:hover {
      background: rgba(6, 182, 212, 0.15);
      border-color: var(--neon-cyan);
      transform: translateY(-2px);
    }

    /* SYSTEM TELEMETRY GRID */
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #38bdf8;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
    }
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .telemetry-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      position: relative;
      overflow: hidden;
    }
    .telemetry-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
    }
    .telemetry-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: var(--font-mono);
      margin-bottom: 6px;
    }
    .telemetry-value {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .telemetry-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
      font-family: var(--font-mono);
    }

    /* REST API EXPLORER */
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
    }
    .endpoint-row {
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      transition: all 0.2s ease;
    }
    .endpoint-row:hover {
      border-color: var(--card-hover);
      box-shadow: 0 4px 18px rgba(6, 182, 212, 0.15);
      background: rgba(13, 20, 32, 0.95);
    }
    .ep-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge-method {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      min-width: 58px;
      text-align: center;
      letter-spacing: 0.5px;
    }
    .method-get {
      background: rgba(6, 182, 212, 0.15);
      color: var(--neon-cyan);
      border: 1px solid rgba(6, 182, 212, 0.35);
    }
    .method-post {
      background: rgba(16, 185, 129, 0.15);
      color: var(--neon-emerald);
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .method-patch {
      background: rgba(245, 158, 11, 0.15);
      color: var(--neon-amber);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .ep-path {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    .ep-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .btn-exec {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: #38bdf8;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-mono);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-exec:hover {
      background: var(--neon-cyan);
      color: #04060a;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
    }

    /* CYBER TERMINAL OUTPUT CONSOLE */
    .terminal-console {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 28px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
    }
    .console-header {
      background: #0d121d;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .console-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot-ctrl {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    .dot-green { background: #22c55e; }
    .console-command {
      font-family: var(--font-mono);
      font-size: 12px;
      color: #cbd5e1;
      margin-left: 6px;
    }
    .console-status {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .console-body {
      padding: 18px;
      position: relative;
    }
    pre {
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #67e8f9;
      max-height: 320px;
      overflow: auto;
      white-space: pre-wrap;
      line-height: 1.6;
      scrollbar-width: thin;
    }

    /* FOOTER */
    .footer {
      text-align: center;
      padding: 24px 0 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: #64748b;
      font-size: 12px;
      font-family: var(--font-mono);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- TOPBAR -->
    <header class="topbar">
      <div class="brand-meta">
        <div class="terminal-badge">⚡</div>
        <div>
          <h1 class="brand-title">brewlite-api<span class="cursor-blink"></span></h1>
          <p class="brand-sub">Production REST Engine • NestJS 10.3 • PostgreSQL</p>
        </div>
      </div>

      <div class="top-chips">
        <div class="chip chip-live">
          <span class="dot"></span>
          <span>SYSTEM ONLINE (200 OK)</span>
        </div>
        <div class="chip chip-mono" id="live-uptime">
          UPTIME: LIVE
        </div>
      </div>
    </header>

    <!-- QUICK ACCESS HERO -->
    <div class="hero-banner">
      <div class="hero-text">
        <h2>🚀 Cổng Điều Hành & Đặt Hàng Trực Tuyến</h2>
        <p>Hệ thống phục vụ đồng thời PWA Khách hàng và POS Quầy nhân viên.</p>
      </div>
      <div class="hero-actions">
        <a href="https://brewlite-web-nt76.onrender.com" target="_blank" class="btn-cyber btn-cyber-primary">
          📱 Khách Hàng (PWA)
        </a>
        <a href="https://brewlite-web-nt76.onrender.com/pos" target="_blank" class="btn-cyber btn-cyber-secondary">
          🏪 Quầy Barista (/pos)
        </a>
      </div>
    </div>

    <!-- TELEMETRY METRICS -->
    <div class="section-title">📊 System Telemetry & Environment</div>
    <div class="telemetry-grid">
      <div class="telemetry-card">
        <div class="telemetry-label">Architecture</div>
        <div class="telemetry-value">NestJS 10</div>
        <div class="telemetry-sub">Modular Monolith • Dockerized</div>
      </div>

      <div class="telemetry-card">
        <div class="telemetry-label">Database Engine</div>
        <div class="telemetry-value">PostgreSQL 16</div>
        <div class="telemetry-sub">Prisma ORM • Connection Pool</div>
      </div>

      <div class="telemetry-card">
        <div class="telemetry-label">Security & Token</div>
        <div class="telemetry-value">JWT Bearer</div>
        <div class="telemetry-sub">CORS: Enabled (*)</div>
      </div>

      <div class="telemetry-card">
        <div class="telemetry-label">Concurrency Control</div>
        <div class="telemetry-value">Idempotent</div>
        <div class="telemetry-sub">DB Transaction Trừ Kho</div>
      </div>
    </div>

    <!-- ENDPOINTS EXPLORER -->
    <div class="section-title">⚡ Interactive REST Explorer</div>
    <div class="endpoints-list">
      <!-- EP: HEALTH -->
      <div class="endpoint-row">
        <div class="ep-left">
          <span class="badge-method method-get">GET</span>
          <div>
            <div class="ep-path">/health</div>
            <div class="ep-desc">Kiểm tra trạng thái máy chủ, bộ nhớ, thời gian hoạt động</div>
          </div>
        </div>
        <button class="btn-exec" onclick="runRequest('/health')">▶ RUN TEST</button>
      </div>

      <!-- EP: PRODUCTS -->
      <div class="endpoint-row">
        <div class="ep-left">
          <span class="badge-method method-get">GET</span>
          <div>
            <div class="ep-path">/products</div>
            <div class="ep-desc">Tải toàn bộ thực đơn kèm Size, Topping và tồn kho thực tế</div>
          </div>
        </div>
        <button class="btn-exec" onclick="runRequest('/products')">▶ RUN TEST</button>
      </div>

      <!-- EP: SEED -->
      <div class="endpoint-row">
        <div class="ep-left">
          <span class="badge-method method-post">POST</span>
          <div>
            <div class="ep-path">/products/seed</div>
            <div class="ep-desc">Tự động khởi tạo dữ liệu mẫu chuẩn cho cơ sở dữ liệu</div>
          </div>
        </div>
        <button class="btn-exec" onclick="runSeed()">▶ SEED DATA</button>
      </div>

      <!-- EP: ORDERS -->
      <div class="endpoint-row">
        <div class="ep-left">
          <span class="badge-method method-get">GET</span>
          <div>
            <div class="ep-path">/orders</div>
            <div class="ep-desc">Lấy danh sách các đơn hàng hiện có trên hệ thống</div>
          </div>
        </div>
        <button class="btn-exec" onclick="runRequest('/orders')">▶ RUN TEST</button>
      </div>

      <!-- EP: LOGIN -->
      <div class="endpoint-row">
        <div class="ep-left">
          <span class="badge-method method-post">POST</span>
          <div>
            <div class="ep-path">/auth/login</div>
            <div class="ep-desc">Cấp Access Token JWT cho tài khoản khách hàng</div>
          </div>
        </div>
        <button class="btn-exec" onclick="runLogin()">▶ TEST AUTH</button>
      </div>
    </div>

    <!-- TERMINAL CONSOLE -->
    <div class="section-title">🖥️ Cyber Terminal Playground</div>
    <div class="terminal-console">
      <div class="console-header">
        <div class="console-controls">
          <span class="dot-ctrl dot-red"></span>
          <span class="dot-ctrl dot-yellow"></span>
          <span class="dot-ctrl dot-green"></span>
          <span class="console-command" id="cmd-preview">curl -X GET https://brewlite-api-ap0d.onrender.com/health</span>
        </div>
        <div class="console-status" id="status-chip">HTTP 200 OK</div>
      </div>
      <div class="console-body">
        <pre id="output-view">// Nhấn nút "▶ RUN TEST" tại bất kỳ Endpoint nào để xem phản hồi JSON thời gian thực...</pre>
      </div>
    </div>

    <footer class="footer">
      BrewLite Platform • Cyber Terminal Edition • Khoa CNTT – ĐH Sài Gòn (2026)
    </footer>
  </div>

  <script>
    const startTime = Date.now();
    setInterval(() => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      const uptimeEl = document.getElementById('live-uptime');
      if (uptimeEl) {
        uptimeEl.innerText = 'SESSION: ' + sec + 's';
      }
    }, 1000);

    async function runRequest(path) {
      const cmdPreview = document.getElementById('cmd-preview');
      const statusChip = document.getElementById('status-chip');
      const outputView = document.getElementById('output-view');

      cmdPreview.innerText = 'curl -X GET ' + window.location.origin + path;
      statusChip.innerText = 'EXECUTING...';
      statusChip.style.color = '#38bdf8';
      statusChip.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      outputView.innerText = '// Sending network packet...';

      const t0 = performance.now();
      try {
        const res = await fetch(path);
        const t1 = performance.now();
        const duration = Math.round(t1 - t0);
        const data = await res.json();

        statusChip.innerText = 'HTTP ' + res.status + ' OK (' + duration + 'ms)';
        statusChip.style.color = '#34d399';
        statusChip.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        outputView.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusChip.innerText = 'ERROR';
        statusChip.style.color = '#f43f5e';
        outputView.innerText = err.toString();
      }
    }

    async function runSeed() {
      const cmdPreview = document.getElementById('cmd-preview');
      const statusChip = document.getElementById('status-chip');
      const outputView = document.getElementById('output-view');

      cmdPreview.innerText = 'curl -X POST ' + window.location.origin + '/products/seed';
      statusChip.innerText = 'SEEDING...';
      outputView.innerText = '// Seeding initial products...';

      try {
        const res = await fetch('/products/seed', { method: 'POST' });
        const data = await res.json();
        statusChip.innerText = 'HTTP ' + res.status + ' DONE';
        statusChip.style.color = '#34d399';
        outputView.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusChip.innerText = 'SEED ERROR';
        outputView.innerText = err.toString();
      }
    }

    async function runLogin() {
      const cmdPreview = document.getElementById('cmd-preview');
      const statusChip = document.getElementById('status-chip');
      const outputView = document.getElementById('output-view');

      cmdPreview.innerText = 'curl -X POST ' + window.location.origin + '/auth/login';
      statusChip.innerText = 'AUTH...';
      outputView.innerText = '// Sending credentials...';

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'customer@brewlite.vn', password: 'password123' })
        });
        const data = await res.json();
        statusChip.innerText = 'HTTP ' + res.status + ' OK';
        statusChip.style.color = '#34d399';
        outputView.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusChip.innerText = 'AUTH ERROR';
        outputView.innerText = err.toString();
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      runRequest('/health');
    });
  </script>
</body>
</html>`;
  }
}
