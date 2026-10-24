'use client';

import React, { useEffect, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  stock: number;
  isAvailable: boolean;
}

export type MenuState = 'loading' | 'error' | 'empty' | 'ready';

export function resolveMenuViewState(
  isLoading: boolean,
  error: string | null,
  products: Product[],
): MenuState {
  if (isLoading) return 'loading';
  if (error) return 'error';
  if (!products || products.length === 0) return 'empty';
  return 'ready';
}

export function formatCurrencyVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export default function MenuView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/products`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Không thể tải thực đơn`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const viewState = resolveMenuViewState(isLoading, error, products);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <header
        style={{
          backgroundColor: '#6f4e37',
          color: '#fff',
          padding: '16px',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>BrewLite Coffee & Tea</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
          Đặt món nhanh trên di động – Không cần xếp hàng
        </p>
      </header>

      {/* TRẠNG THÁI 1: LOADING */}
      {viewState === 'loading' && (
        <section
          role="status"
          aria-live="polite"
          style={{ textAlign: 'center', padding: 32, color: '#666' }}
        >
          <p>Đang tải thực đơn đồ uống...</p>
        </section>
      )}

      {/* TRẠNG THÁI 2: ERROR */}
      {viewState === 'error' && (
        <section
          role="alert"
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: 16,
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 12px' }}>Đã xảy ra lỗi: {error}</p>
          <button
            onClick={fetchMenu}
            style={{
              backgroundColor: '#991b1b',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </section>
      )}

      {/* TRẠNG THÁI 3: EMPTY */}
      {viewState === 'empty' && (
        <section style={{ textAlign: 'center', padding: 32, color: '#666' }}>
          <p>Hiện chưa có đồ uống nào trong thực đơn.</p>
        </section>
      )}

      {/* TRẠNG THÁI 4: READY (HIỂN THỊ DANH SÁCH MENU MOBILE-FIRST) */}
      {viewState === 'ready' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              style={{
                display: 'flex',
                gap: 12,
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                cursor: 'pointer',
                backgroundColor: '#fff',
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: '#6f4e37', fontWeight: 600 }}>
                  {item.category}
                </span>
                <h2 style={{ margin: '2px 0 4px', fontSize: 16 }}>{item.name}</h2>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#111827' }}>{formatCurrencyVND(item.basePrice)}</strong>
                  <span style={{ fontSize: 12, color: item.stock > 0 ? '#059669' : '#dc2626' }}>
                    {item.stock > 0 ? `Còn ${item.stock} ly` : 'Hết hàng'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* MODAL XEM NHANH CHI TIẾT MÓN */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: 480,
              padding: 20,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{selectedProduct.name}</h3>
            <p style={{ color: '#4b5563', fontSize: 14 }}>{selectedProduct.description}</p>
            <p>
              <strong>Giá gốc:</strong> {formatCurrencyVND(selectedProduct.basePrice)}
            </p>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#6f4e37',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </main>
  );
}