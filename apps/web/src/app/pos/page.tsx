'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface OrderItemRecord {
  productId: string;
  productName: string;
  quantity: number;
  selectedSize: string;
  selectedToppings: string[];
  unitPrice: number;
  totalPrice: number;
}

interface OrderRecord {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  items: OrderItemRecord[];
  totalAmount: number;
  createdAt: string;
}

function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export default function PosTerminalPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [staffPass, setStaffPass] = useState<string>('staff123');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const apiUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_API_URL || '';
    if (
      raw === 'https://brewlite-api.onrender.com' ||
      (!raw && typeof window !== 'undefined' && window.location.hostname.includes('onrender.com'))
    ) {
      return 'https://brewlite-api-ap0d.onrender.com';
    }
    return raw || 'http://localhost:4000';
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Gọi API lấy danh sách đơn hàng
      const res = await fetch(`${apiUrl}/orders`);
      if (res.ok) {
        const data: OrderRecord[] = await res.json();
        setOrders(data);
      }
    } catch {
      // Handle offline or fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling realtime 8s
    return () => clearInterval(interval);
  }, [apiUrl]);

  const updateStatus = async (orderId: string, nextStatus: OrderRecord['status']) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(` Đã chuyển đơn #${orderId} sang "${nextStatus}"`);
        await fetchOrders();
      } else {
        showToast('⚠️ Không thể cập nhật trạng thái');
      }
    } catch {
      showToast('❌ Lỗi kết nối');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PREPARING');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 16px',
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* HEADER QUẦY POS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #334155',
            paddingBottom: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>🏪</span>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>
                BrewLite POS – Quầy Thu Ngân & Barista
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Màn hình dành riêng cho nhân viên cửa hàng • Cập nhật đơn theo thời gian thực
            </p>
          </div>

          <Link
            href="/"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
            }}
          >
            ⬅ Về trang Khách hàng
          </Link>
        </div>

        {/* METRICS DASHBOARD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Đang chờ pha chế
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
              {pendingOrders.length} đơn
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Tổng đơn hôm nay
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
              {orders.length} đơn
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Doanh thu tạm tính
            </span>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {formatVND(totalRevenue)}
            </div>
          </div>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG THỜI GIAN THỰC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            Hàng đợi đơn hàng (Order Queue)
          </h2>
          <button
            onClick={fetchOrders}
            style={{
              background: 'none',
              border: '1px solid #475569',
              color: '#94a3b8',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🔄 Làm mới
          </button>
        </div>

        {isLoading && orders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Đang nạp dữ liệu...</p>
        ) : orders.length === 0 ? (
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '36px',
              textAlign: 'center',
              color: '#94a3b8',
            }}
          >
            Chưa có đơn hàng nào đổ về quầy. Khi khách hàng đặt đơn trên web app, đơn sẽ xuất hiện ngay tại đây!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  backgroundColor: '#1e293b',
                  border:
                    ord.status === 'PAID'
                      ? '1.5px solid #d97706'
                      : ord.status === 'PREPARING'
                      ? '1.5px solid #0284c7'
                      : '1px solid #334155',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 15, color: '#fff' }}>Đơn hàng #{ord.id}</strong>
                    <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                      {new Date(ord.createdAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 10,
                      backgroundColor:
                        ord.status === 'PAID'
                          ? '#78350f'
                          : ord.status === 'PREPARING'
                          ? '#0c4a6e'
                          : '#064e3b',
                      color:
                        ord.status === 'PAID'
                          ? '#fde68a'
                          : ord.status === 'PREPARING'
                          ? '#7dd3fc'
                          : '#6ee7b7',
                    }}
                  >
                    {ord.status === 'PAID'
                      ? ' MỚI ĐẶT'
                      : ord.status === 'PREPARING'
                      ? '⏳ ĐANG PHA CHẾ'
                      : ord.status === 'COMPLETED'
                      ? ' HOÀN THÀNH'
                      : ord.status}
                  </span>
                </div>

                {/* CHI TIẾT MÓN CẦN LÀM */}
                <div style={{ margin: '12px 0', padding: '10px', backgroundColor: '#0f172a', borderRadius: 8 }}>
                  {ord.items?.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        padding: '3px 0',
                      }}
                    >
                      <span>
                        • <strong>{it.productName}</strong> (Size <strong>{it.selectedSize}</strong>) x <strong>{it.quantity}</strong>
                        {it.selectedToppings?.length > 0 && (
                          <span style={{ color: '#94a3b8' }}> (+ Topping)</span>
                        )}
                      </span>
                      <span style={{ color: '#94a3b8' }}>{formatVND(it.totalPrice)}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 6,
                      borderTop: '1px dashed #334155',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span>Thu tiền:</span>
                    <span style={{ color: '#10b981' }}>{formatVND(ord.totalAmount)}</span>
                  </div>
                </div>

                {/* NÚT THAO TÁC CỦA BARISTA */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {ord.status === 'PAID' && (
                    <button
                      onClick={() => updateStatus(ord.id, 'PREPARING')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#d97706',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ⏳ Nhận đơn & Bắt đầu pha chế
                    </button>
                  )}

                  {ord.status === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(ord.id, 'COMPLETED')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔔 Báo xong • Sẵn sàng giao khách
                    </button>
                  )}

                  {ord.status === 'COMPLETED' && (
                    <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                      ✅ Khách đã nhận đồ uống thành công
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

