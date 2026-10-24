'use client';

import React, { useEffect, useState } from 'react';

export interface SizeOption {
  name: 'S' | 'M' | 'L';
  priceDelta: number;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  availableSizes?: SizeOption[];
  availableToppings?: ToppingOption[];
  stock: number;
  isAvailable: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedSize: 'S' | 'M' | 'L';
  selectedToppings: ToppingOption[];
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    selectedSize: string;
    totalPrice: number;
  }[];
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

export function calculateUnitPrice(
  product: Product,
  selectedSize: 'S' | 'M' | 'L',
  selectedToppings: ToppingOption[],
): number {
  const sizeDelta =
    product.availableSizes?.find((s) => s.name === selectedSize)?.priceDelta || 0;
  const toppingSum = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  return product.basePrice + sizeDelta + toppingSum;
}

export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export default function MenuView() {
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'auth'>('menu');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State chọn món & tùy chọn Size/Topping
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // State Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);

  // State Xác thực (JWT)
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('customer@brewlite.vn');
  const [userPassword, setUserPassword] = useState<string>('123456');
  const [userFullName, setUserFullName] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // State Thanh toán & Đơn hàng
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

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

  const fetchMyOrders = async (jwtToken: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openProductModal = (item: Product) => {
    setSelectedProduct(item);
    const defaultSize = item.availableSizes?.[0]?.name || 'S';
    setSelectedSize(defaultSize);
    setSelectedToppings([]);
    setQuantity(1);
  };

  const toggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping],
    );
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const unitPrice = calculateUnitPrice(selectedProduct, selectedSize, selectedToppings);
    const newItem: CartItem = {
      cartItemId: `${selectedProduct.id}-${selectedSize}-${selectedToppings
        .map((t) => t.id)
        .join(',')}`,
      product: selectedProduct,
      quantity,
      selectedSize,
      selectedToppings,
      unitPrice,
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    setSelectedProduct(null);
    setActiveTab('cart');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    try {
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          fullName: userFullName || 'Khách Hàng Mới',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Xác thực thất bại');
      }
      setToken(data.accessToken);
      setAuthMessage(`Xin chào ${data.user.fullName} (${data.user.email})`);
      fetchMyOrders(data.accessToken);
    } catch (err: unknown) {
      setAuthMessage(err instanceof Error ? err.message : 'Lỗi đăng nhập');
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      setCheckoutStatus('Vui lòng đăng nhập trước khi đặt đơn!');
      setActiveTab('auth');
      return;
    }
    setCheckoutStatus('Đang xử lý đơn hàng và thanh toán...');
    try {
      const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          paymentMethod,
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            selectedSize: c.selectedSize,
            selectedToppings: c.selectedToppings.map((t) => t.id),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đặt đơn thất bại');
      }

      setCart([]);
      setCheckoutStatus(
        `Đặt đơn thành công! Mã đơn: ${data.order.id} – Trạng thái: ${data.order.status}`,
      );
      await fetchMenu();
      await fetchMyOrders(token);
      setActiveTab('orders');
    } catch (err: unknown) {
      setCheckoutStatus(err instanceof Error ? err.message : 'Lỗi thanh toán');
    }
  };

  const viewState = resolveMenuViewState(isLoading, error, products);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <header
        style={{
          backgroundColor: '#6f4e37',
          color: '#fff',
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20 }}>BrewLite Coffee & Tea</h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.9 }}>
          Đặt món Mobile-first / PWA – Nhanh chóng & An toàn
        </p>
      </header>

      {/* THANH ĐIỀU HƯỚNG MOBILE-FIRST */}
      <nav style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['menu', 'cart', 'orders', 'auth'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#6f4e37' : '#e5e7eb',
              color: activeTab === tab ? '#fff' : '#1f2937',
            }}
          >
            {tab === 'menu' && 'Thực đơn'}
            {tab === 'cart' && `Giỏ (${cart.length})`}
            {tab === 'orders' && 'Đơn hàng'}
            {tab === 'auth' && (token ? 'Đã ĐN' : 'Đăng nhập')}
          </button>
        ))}
      </nav>

      {checkoutStatus && (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: 13,
          }}
        >
          {checkoutStatus}
        </div>
      )}

      {/* TAB 1: THỰC ĐƠN (MENU) */}
      {activeTab === 'menu' && (
        <>
          {viewState === 'loading' && (
            <section role="status" style={{ textAlign: 'center', padding: 32 }}>
              <p>Đang tải thực đơn đồ uống...</p>
            </section>
          )}

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
              <p>Đã xảy ra lỗi: {error}</p>
              <button onClick={fetchMenu}>Thử lại</button>
            </section>
          )}

          {viewState === 'empty' && (
            <section style={{ textAlign: 'center', padding: 32 }}>
              <p>Hiện chưa có đồ uống nào trong thực đơn.</p>
            </section>
          )}

          {viewState === 'ready' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {products.map((item) => (
                <article
                  key={item.id}
                  onClick={() => openProductModal(item)}
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
                    style={{ width: 76, height: 76, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, color: '#6f4e37', fontWeight: 600 }}>
                      {item.category}
                    </span>
                    <h2 style={{ margin: '2px 0 4px', fontSize: 16 }}>{item.name}</h2>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280' }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{formatCurrencyVND(item.basePrice)}</strong>
                      <span style={{ fontSize: 12, color: item.stock > 0 ? '#059669' : '#dc2626' }}>
                        {item.stock > 0 ? `Còn ${item.stock} ly` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {/* TAB 2: GIỎ HÀNG & THANH TOÁN */}
      {activeTab === 'cart' && (
        <section style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Giỏ hàng của bạn</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Giỏ hàng đang trống. Hãy chọn món từ Thực đơn!</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>
                      {item.product.name} (Size {item.selectedSize}) x {item.quantity}
                    </strong>
                    <span>{formatCurrencyVND(item.unitPrice * item.quantity)}</span>
                  </div>
                  {item.selectedToppings.length > 0 && (
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                    </div>
                  )}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Xóa món
                  </button>
                </div>
              ))}

              <div style={{ margin: '16px 0' }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Phương thức thanh toán:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'WALLET' | 'CARD')}
                  style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6 }}
                >
                  <option value="WALLET">Ví điện tử BrewPay (Mô phỏng)</option>
                  <option value="CARD">Thẻ ngân hàng (Mô phỏng)</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                <span>Tổng cộng:</span>
                <span>{formatCurrencyVND(calculateCartTotal(cart))}</span>
              </div>

              <button
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đặt đơn & Thanh toán ngay
              </button>
            </>
          )}
        </section>
      )}

      {/* TAB 3: LỊCH SỬ & THEO DÕI ĐƠN HÀNG */}
      {activeTab === 'orders' && (
        <section style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Lịch sử & Trạng thái Đơn hàng</h2>
          {orders.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Chưa có đơn hàng nào.</p>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{ord.id}</strong>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: ord.status === 'PAID' ? '#059669' : '#d97706',
                    }}
                  >
                    {ord.status}
                  </span>
                </div>
                <p style={{ margin: '6px 0', fontSize: 13 }}>
                  Tổng tiền: <strong>{formatCurrencyVND(ord.totalAmount)}</strong>
                </p>
              </div>
            ))
          )}
        </section>
      )}

      {/* TAB 4: ĐĂNG NHẬP / ĐĂNG KÝ (JWT) */}
      {activeTab === 'auth' && (
        <section style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>
            {isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}
          </h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isRegisterMode && (
              <input
                type="text"
                placeholder="Họ và tên"
                value={userFullName}
                onChange={(e) => setUserFullName(e.target.value)}
                style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
            />
            <button
              type="submit"
              style={{
                padding: 12,
                backgroundColor: '#6f4e37',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isRegisterMode ? 'Tạo tài khoản & Nhận JWT' : 'Đăng nhập'}
            </button>
          </form>
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{
              marginTop: 10,
              background: 'none',
              border: 'none',
              color: '#6f4e37',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký mới'}
          </button>
          {authMessage && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#059669' }}>{authMessage}</p>
          )}
        </section>
      )}

      {/* MODAL CHỌN SIZE & TOPPING */}
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
            <p style={{ color: '#4b5563', fontSize: 13 }}>{selectedProduct.description}</p>

            {/* Chọn Size */}
            {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>Chọn kích cỡ (Size):</strong>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {selectedProduct.availableSizes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSize(s.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #6f4e37',
                        backgroundColor: selectedSize === s.name ? '#6f4e37' : '#fff',
                        color: selectedSize === s.name ? '#fff' : '#6f4e37',
                        cursor: 'pointer',
                      }}
                    >
                      Size {s.name} (+{formatCurrencyVND(s.priceDelta)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn Topping */}
            {selectedProduct.availableToppings && selectedProduct.availableToppings.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>Chọn Topping:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                  {selectedProduct.availableToppings.map((top) => (
                    <label key={top.id} style={{ fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={selectedToppings.some((t) => t.id === top.id)}
                        onChange={() => toggleTopping(top)}
                      />{' '}
                      {top.name} (+{formatCurrencyVND(top.price)})
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={addToCart}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#6f4e37',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Thêm vào giỏ –{' '}
                {formatCurrencyVND(
                  calculateUnitPrice(selectedProduct, selectedSize, selectedToppings) * quantity,
                )}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  padding: 12,
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}