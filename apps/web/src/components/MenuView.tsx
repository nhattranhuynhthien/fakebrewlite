'use client';

import React, { useEffect, useState, useMemo } from 'react';

// ==========================================
// 1. DATA TYPES (KHAI BÁO KIỂU DỮ LIỆU)
// ==========================================
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

export interface OrderItemRecord {
  productId: string;
  productName: string;
  quantity: number;
  selectedSize: string;
  selectedToppings: string[];
  unitPrice: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  items: OrderItemRecord[];
  totalAmount: number;
  createdAt: string;
}

export type MenuState = 'loading' | 'error' | 'empty' | 'ready';

// ==========================================
// 2. HELPER FUNCTIONS (CHO PHÉP TEST WEB-T01 & E2E-T01)
// ==========================================
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

// ==========================================
// 3. MAIN COMPONENT (GIAO DIỆN TỐI ƯU 2 BÊN)
// ==========================================
export default function MenuView() {
  // Vai trò giao diện: 'customer' (Khách hàng) hoặc 'store' (Quản lý / Quầy Barista)
  const [roleMode, setRoleMode] = useState<'customer' | 'store'>('customer');

  // Tab điều hướng cho khách: 'menu' | 'cart' | 'orders' | 'auth'
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'auth'>('menu');

  // Dữ liệu sản phẩm & tìm kiếm
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Modal tùy chọn món (Size & Topping)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);

  // Xác thực người dùng (Auth)
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string } | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('customer@brewlite.vn');
  const [authPassword, setAuthPassword] = useState<string>('123456');
  const [authFullName, setAuthFullName] = useState<string>('Khách Hàng Demo');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Thanh toán & Đơn hàng
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Nhận diện URL API chính xác
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
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tải danh sách thực đơn
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
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Tải đơn hàng của người dùng
  const fetchMyOrders = async (token: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: OrderRecord[] = await res.json();
        setOrders(data);
      }
    } catch {
      // Bỏ qua lỗi ngầm
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [apiUrl]);

  // Danh mục đồ uống
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['Tất cả', ...cats];
  }, [products]);

  // Lọc sản phẩm theo danh mục và từ khóa
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Mở modal tùy chọn món
  const openCustomizationModal = (item: Product) => {
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

  // Thêm vào giỏ hàng
  const addToCart = () => {
    if (!selectedProduct) return;
    const unitPrice = calculateUnitPrice(selectedProduct, selectedSize, selectedToppings);
    const newItem: CartItem = {
      cartItemId: `${selectedProduct.id}-${selectedSize}-${selectedToppings.map((t) => t.id).sort().join(',')}`,
      product: selectedProduct,
      quantity,
      selectedSize,
      selectedToppings,
      unitPrice,
    };

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, newItem];
    });

    const drinkName = selectedProduct.name;
    setSelectedProduct(null);
    showToast(` Đã thêm "${drinkName} (Size ${selectedSize})" vào giỏ hàng!`);
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  // Xử lý đăng nhập / đăng ký
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          fullName: authFullName || 'Khách Hàng',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xác thực thất bại');

      setJwtToken(data.accessToken);
      setCurrentUser(data.user);
      showToast(` Xin chào, ${data.user.fullName}!`);
      await fetchMyOrders(data.accessToken);
      setActiveTab('menu');
    } catch (err: unknown) {
      showToast(` ${err instanceof Error ? err.message : 'Lỗi đăng nhập'}`);
    }
  };

  // Đăng nhập nhanh với tài khoản Demo
  const quickDemoLogin = () => {
    setAuthEmail('customer@brewlite.vn');
    setAuthPassword('123456');
    setAuthFullName('Khách Hàng Demo');
    setIsRegisterMode(false);
    setTimeout(() => {
      const form = document.getElementById('auth-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  };

  // Đặt hàng & thanh toán
  const handleCheckout = async () => {
    if (!jwtToken) {
      showToast('⚠️ Vui lòng đăng nhập trước khi thanh toán!');
      setActiveTab('auth');
      return;
    }
    if (cart.length === 0) {
      showToast('⚠️ Giỏ hàng đang trống!');
      return;
    }

    showToast(' Đang xử lý giao dịch qua cổng thanh toán...');
    try {
      const idemKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify({
          paymentMethod,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedSize: i.selectedSize,
            selectedToppings: i.selectedToppings.map((t) => t.id),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt đơn thất bại');

      setCart([]);
      showToast(` Đặt hàng thành công! Mã đơn: ${data.order.id}`);
      await fetchMenu();
      await fetchMyOrders(jwtToken);
      setActiveTab('orders');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Lỗi thanh toán'}`);
    }
  };

  // Phía Quầy: Cập nhật trạng thái đơn hàng (Barista Action)
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderRecord['status']) => {
    if (!jwtToken) {
      showToast('⚠️ Cần đăng nhập để cập nhật đơn!');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Không thể đổi trạng thái');
      showToast(` Đơn ${orderId} đã chuyển sang "${nextStatus}"`);
      await fetchMyOrders(jwtToken);
    } catch (err: unknown) {
      showToast(` ${err instanceof Error ? err.message : 'Lỗi cập nhật'}`);
    }
  };

  const viewState = resolveMenuViewState(isLoading, error, products);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: '#1e293b',
        paddingBottom: 85,
      }}
    >
      {/* TOAST NOTIFICATION FLOATING */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* HEADER CAO CẤP & BỘ CHUYỂN VAI TRÒ 2 BÊN */}
      <header
        style={{
          background: 'linear-gradient(135deg, #4a2c1b 0%, #6f4e37 100%)',
          color: '#fff',
          padding: '16px 20px 20px',
          boxShadow: '0 4px 16px rgba(111,78,55,0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 22 }}>☕</span>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>
                BrewLite Coffee
              </h1>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85 }}>
              PWA Mobile-first • Đặt đồ uống trực tuyến
            </p>
          </div>

          {/* CHUYỂN ĐỔI CHẾ ĐỘ 2 BÊN: KHÁCH HÀNG VS QUẦY / BARISTA */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: 3,
              borderRadius: 20,
              backdropFilter: 'blur(4px)',
            }}
          >
            <button
              onClick={() => setRoleMode('customer')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: roleMode === 'customer' ? '#fff' : 'transparent',
                color: roleMode === 'customer' ? '#6f4e37' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              👤 Khách
            </button>
            <button
              onClick={() => setRoleMode('store')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: roleMode === 'store' ? '#fff' : 'transparent',
                color: roleMode === 'store' ? '#6f4e37' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              🏪 Quầy POS
            </button>
          </div>
        </div>

        {/* THÔNG TIN USER ĐĂNG NHẬP (NẾU CÓ) */}
        {currentUser && (
          <div
            style={{
              maxWidth: 480,
              margin: '10px auto 0',
              padding: '6px 12px',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            <span>
              Xin chào, <strong>{currentUser.fullName}</strong>
            </span>
            <button
              onClick={() => {
                setJwtToken(null);
                setCurrentUser(null);
                setOrders([]);
                showToast('Đã đăng xuất');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#fca5a5',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </header>

      {/* CONTAINER CHÍNH */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        {/* ========================================================= */}
        {/* VIEW 1: BÊN KHÁCH HÀNG (CUSTOMER VIEW)                    */}
        {/* ========================================================= */}
        {roleMode === 'customer' && (
          <>
            {/* TAB 1: THỰC ĐƠN ĐỒ UỐNG */}
            {activeTab === 'menu' && (
              <div>
                {/* THANH TÌM KIẾM MÓN */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="🔍 Tìm món trà sữa, cà phê..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 16px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 11,
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* BỘ LỌC DANH MỤC DẠNG PILL */}
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 8,
                    marginBottom: 12,
                    scrollbarWidth: 'none',
                  }}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        whiteSpace: 'nowrap',
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: selectedCategory === cat ? '#6f4e37' : '#fff',
                        color: selectedCategory === cat ? '#fff' : '#64748b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* TRẠNG THÁI LOADING */}
                {viewState === 'loading' && (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                    <p style={{ margin: 0, fontSize: 14 }}>Đang tải thực đơn đồ uống...</p>
                  </div>
                )}

                {/* TRẠNG THÁI ERROR */}
                {viewState === 'error' && (
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      padding: 16,
                      borderRadius: 12,
                      textAlign: 'center',
                      color: '#b91c1c',
                    }}
                  >
                    <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 500 }}>
                      ⚠️ Đã xảy ra lỗi: {error}
                    </p>
                    <button
                      onClick={fetchMenu}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 18px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Thử lại kết nối
                    </button>
                  </div>
                )}

                {/* TRẠNG THÁI EMPTY */}
                {viewState === 'empty' && (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                    <p style={{ margin: 0, fontSize: 14 }}>Hiện chưa có món nào trong thực đơn.</p>
                  </div>
                )}

                {/* DANH SÁCH MÓN ĐỒ UỐNG (READY) */}
                {viewState === 'ready' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredProducts.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => openCustomizationModal(item)}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 14,
                          padding: 12,
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          border: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: 82,
                            height: 82,
                            borderRadius: 10,
                            objectFit: 'cover',
                            backgroundColor: '#f1f5f9',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#6f4e37',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            {item.category}
                          </span>
                          <h3
                            style={{
                              margin: '2px 0 4px',
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </h3>
                          <p
                            style={{
                              margin: '0 0 6px',
                              fontSize: 12,
                              color: '#64748b',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3,
                            }}
                          >
                            {item.description}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              {formatCurrencyVND(item.basePrice)}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 12,
                                backgroundColor: item.stock > 0 ? '#ecfdf5' : '#fef2f2',
                                color: item.stock > 0 ? '#059669' : '#dc2626',
                                fontWeight: 600,
                              }}
                            >
                              {item.stock > 0 ? `Còn ${item.stock} ly` : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GIỎ HÀNG */}
            {activeTab === 'cart' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>
                  🛒 Giỏ hàng ({totalCartCount} món)
                </h2>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>🛍️</div>
                    <p style={{ margin: '0 0 16px', fontSize: 13 }}>Giỏ hàng của bạn đang trống.</p>
                    <button
                      onClick={() => setActiveTab('menu')}
                      style={{
                        backgroundColor: '#6f4e37',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Chọn món ngay
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cart.map((item) => (
                        <div
                          key={item.cartItemId}
                          style={{
                            display: 'flex',
                            gap: 12,
                            paddingBottom: 12,
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                                  {item.product.name}
                                </h4>
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  Size {item.selectedSize}
                                </span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                {formatCurrencyVND(item.unitPrice * item.quantity)}
                              </span>
                            </div>

                            {item.selectedToppings.length > 0 && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                + {item.selectedToppings.map((t) => t.name).join(', ')}
                              </div>
                            )}

                            {/* BỘ TĂNG GIẢM SỐ LƯỢNG MÓN */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 8,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                }}
                              >
                                <button
                                  onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                                  style={{
                                    border: 'none',
                                    background: '#f8fafc',
                                    padding: '4px 10px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                  }}
                                >
                                  -
                                </button>
                                <span
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    minWidth: 18,
                                    textAlign: 'center',
                                  }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                                  style={{
                                    border: 'none',
                                    background: '#f8fafc',
                                    padding: '4px 10px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => updateCartItemQuantity(item.cartItemId, -item.quantity)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: 11,
                                  cursor: 'pointer',
                                }}
                              >
                                Xóa món
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* PHƯƠNG THỨC THANH TOÁN */}
                    <div style={{ marginTop: 18 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                        Phương thức thanh toán:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('WALLET')}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 10,
                            border: paymentMethod === 'WALLET' ? '2px solid #6f4e37' : '1px solid #e2e8f0',
                            backgroundColor: paymentMethod === 'WALLET' ? '#fdf8f6' : '#fff',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span>📱</span> Ví Điện Tử
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CARD')}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 10,
                            border: paymentMethod === 'CARD' ? '2px solid #6f4e37' : '1px solid #e2e8f0',
                            backgroundColor: paymentMethod === 'CARD' ? '#fdf8f6' : '#fff',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span>💳</span> Thẻ Ngân Hàng
                        </button>
                      </div>
                    </div>

                    {/* TỔNG TIỀN VÀ NÚT ĐẶT ĐƠN */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px dashed #f1f5f9' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          color: '#64748b',
                          marginBottom: 6,
                        }}
                      >
                        <span>Tạm tính ({totalCartCount} ly)</span>
                        <span>{formatCurrencyVND(calculateCartTotal(cart))}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          color: '#64748b',
                          marginBottom: 12,
                        }}
                      >
                        <span>Phí đóng gói & phục vụ</span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>Miễn phí (0 đ)</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 17,
                          fontWeight: 800,
                          color: '#0f172a',
                          marginBottom: 16,
                        }}
                      >
                        <span>Tổng thanh toán:</span>
                        <span style={{ color: '#6f4e37' }}>
                          {formatCurrencyVND(calculateCartTotal(cart))}
                        </span>
                      </div>

                      <button
                        onClick={handleCheckout}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: 12,
                          backgroundColor: '#059669',
                          color: '#fff',
                          border: 'none',
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
                        }}
                      >
                        Thanh toán ngay • {formatCurrencyVND(calculateCartTotal(cart))}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: THEO DÕI ĐƠN HÀNG */}
            {activeTab === 'orders' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📋 Lịch sử & Đơn của bạn</h2>
                  {jwtToken && (
                    <button
                      onClick={() => fetchMyOrders(jwtToken)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6f4e37',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Cập nhật
                    </button>
                  )}
                </div>

                {!jwtToken ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 13 }}>
                      Vui lòng đăng nhập để theo dõi trạng thái đơn hàng.
                    </p>
                    <button
                      onClick={() => setActiveTab('auth')}
                      style={{
                        backgroundColor: '#6f4e37',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', margin: 0 }}>
                    Bạn chưa có đơn hàng nào hôm nay.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: 14,
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            Mã đơn: #{ord.id}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 12,
                              backgroundColor:
                                ord.status === 'PAID'
                                  ? '#ecfdf5'
                                  : ord.status === 'PREPARING'
                                  ? '#fef3c7'
                                  : ord.status === 'COMPLETED'
                                  ? '#eff6ff'
                                  : '#f1f5f9',
                              color:
                                ord.status === 'PAID'
                                  ? '#059669'
                                  : ord.status === 'PREPARING'
                                  ? '#d97706'
                                  : ord.status === 'COMPLETED'
                                  ? '#2563eb'
                                  : '#64748b',
                            }}
                          >
                            {ord.status === 'PAID'
                              ? ' ĐÃ THANH TOÁN'
                              : ord.status === 'PREPARING'
                              ? '⏳ ĐANG PHA CHẾ'
                              : ord.status === 'COMPLETED'
                              ? ' SẴN SÀNG NHẬN ĐỒ'
                              : ord.status}
                          </span>
                        </div>

                        {/* STEPPER TRẠNG THÁI */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 4,
                            margin: '10px 0',
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          <div
                            style={{
                              padding: '4px',
                              borderRadius: 4,
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                            }}
                          >
                            1. Đã đặt
                          </div>
                          <div
                            style={{
                              padding: '4px',
                              borderRadius: 4,
                              backgroundColor:
                                ord.status === 'PREPARING' || ord.status === 'COMPLETED'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                              color:
                                ord.status === 'PREPARING' || ord.status === 'COMPLETED'
                                  ? '#d97706'
                                  : '#94a3b8',
                            }}
                          >
                            2. Pha chế
                          </div>
                          <div
                            style={{
                              padding: '4px',
                              borderRadius: 4,
                              backgroundColor: ord.status === 'COMPLETED' ? '#eff6ff' : '#f1f5f9',
                              color: ord.status === 'COMPLETED' ? '#2563eb' : '#94a3b8',
                            }}
                          >
                            3. Nhận món
                          </div>
                        </div>

                        <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                          {ord.items?.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>
                                {it.productName} (Size {it.selectedSize}) x {it.quantity}
                              </span>
                              <span>{formatCurrencyVND(it.totalPrice)}</span>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: '1px solid #e2e8f0',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          <span>Tổng cộng:</span>
                          <span style={{ color: '#6f4e37' }}>{formatCurrencyVND(ord.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ĐĂNG NHẬP / ĐĂNG KÝ */}
            {activeTab === 'auth' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <button
                    onClick={() => setIsRegisterMode(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: !isRegisterMode ? '#6f4e37' : '#f1f5f9',
                      color: !isRegisterMode ? '#fff' : '#64748b',
                    }}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setIsRegisterMode(true)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: isRegisterMode ? '#6f4e37' : '#f1f5f9',
                      color: isRegisterMode ? '#fff' : '#64748b',
                    }}
                  >
                    Tạo tài khoản
                  </button>
                </div>

                {/* NÚT ĐĂNG NHẬP NHANH DEMO */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 16,
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>
                    💡 Dành cho Giảng viên / Đánh giá nhanh:
                  </p>
                  <button
                    type="button"
                    onClick={quickDemoLogin}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 8,
                      border: '1px solid #6f4e37',
                      backgroundColor: '#fff',
                      color: '#6f4e37',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Đăng nhập 1-chạm với tài khoản Khách Demo
                  </button>
                </div>

                <form id="auth-form" onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {isRegisterMode && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Họ và tên:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn A"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: 10,
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Địa chỉ Email:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Mật khẩu:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ít nhất 6 ký tự"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: '#6f4e37',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {isRegisterMode ? 'Đăng ký & Nhận JWT' : 'Đăng nhập hệ thống'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: BÊN QUẢN LÝ / QUẦY BARISTA (STORE POS VIEW)        */}
        {/* ========================================================= */}
        {roleMode === 'store' && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 18,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  🏪 Màn hình Quầy Barista (POS Terminal)
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
                  Xử lý đơn hàng đến theo thời gian thực (Realtime Order Queue)
                </p>
              </div>
            </div>

            {/* THỐNG KÊ NHANH CHO QUẢN LÝ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ backgroundColor: '#fdf8f6', border: '1px solid #fed7aa', borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: 11, color: '#9a3412', fontWeight: 600 }}>Tổng đơn hôm nay</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#6f4e37', marginTop: 2 }}>
                  {orders.length} đơn
                </div>
              </div>
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 12 }}>
                <span style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Doanh thu ghi nhận</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                  {formatCurrencyVND(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>
                Chưa có đơn hàng nào cần pha chế.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: ord.status === 'PAID' ? '#fdf8f6' : '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 14 }}>Mã đơn: #{ord.id}</strong>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 8,
                          backgroundColor:
                            ord.status === 'PAID'
                              ? '#fef3c7'
                              : ord.status === 'PREPARING'
                              ? '#dbeafe'
                              : '#dcfce7',
                          color:
                            ord.status === 'PAID'
                              ? '#b45309'
                              : ord.status === 'PREPARING'
                              ? '#1d4ed8'
                              : '#15803d',
                        }}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div style={{ margin: '8px 0', fontSize: 12, color: '#334155' }}>
                      {ord.items.map((it, idx) => (
                        <div key={idx} style={{ padding: '2px 0' }}>
                          • <strong>{it.productName}</strong> (Size {it.selectedSize}) x{it.quantity}
                          {it.selectedToppings?.length > 0 && (
                            <span style={{ color: '#64748b' }}> (+Topping)</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* NÚT THAO TÁC CẬP NHẬT TRẠNG THÁI CỦA QUẦY */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                      {ord.status === 'PAID' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#d97706',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ⏳ Bắt đầu pha chế
                        </button>
                      )}

                      {ord.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          🔔 Báo xong / Giao đồ
                        </button>
                      )}

                      {ord.status === 'COMPLETED' && (
                        <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                          ✅ Đơn đã hoàn tất bàn giao
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL TÙY CHỌN SIZE & TOPPING (BOTTOM SHEET DRAWER) */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: 480,
              padding: '20px 20px 28px',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                style={{ width: 75, height: 75, borderRadius: 12, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>
                  {selectedProduct.name}
                </h3>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b', lineHeight: 1.3 }}>
                  {selectedProduct.description}
                </p>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#6f4e37' }}>
                  {formatCurrencyVND(selectedProduct.basePrice)}
                </span>
              </div>
            </div>

            {/* CHỌN SIZE */}
            {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                  Chọn kích cỡ (Size):
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedProduct.availableSizes.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedSize(s.name)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: selectedSize === s.name ? '2px solid #6f4e37' : '1px solid #e2e8f0',
                        backgroundColor: selectedSize === s.name ? '#fdf8f6' : '#fff',
                        color: selectedSize === s.name ? '#6f4e37' : '#334155',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Size {s.name}
                      <span style={{ display: 'block', fontSize: 11, opacity: 0.8 }}>
                        +{formatCurrencyVND(s.priceDelta)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CHỌN TOPPING */}
            {selectedProduct.availableToppings && selectedProduct.availableToppings.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                  Chọn Topping thêm:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedProduct.availableToppings.map((top) => {
                    const isChecked = selectedToppings.some((t) => t.id === top.id);
                    return (
                      <div
                        key={top.id}
                        onClick={() => toggleTopping(top)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: isChecked ? '1.5px solid #6f4e37' : '1px solid #e2e8f0',
                          backgroundColor: isChecked ? '#fdf8f6' : '#fff',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        <span style={{ fontWeight: isChecked ? 600 : 400 }}>{top.name}</span>
                        <span style={{ color: '#6f4e37', fontWeight: 600 }}>
                          +{formatCurrencyVND(top.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BỘ CHỌN SỐ LƯỢNG LY */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>Số lượng:</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* NÚT THÊM VÀO GIỎ */}
            <button
              type="button"
              onClick={addToCart}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                backgroundColor: '#6f4e37',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(111,78,55,0.35)',
              }}
            >
              Thêm vào giỏ •{' '}
              {formatCurrencyVND(
                calculateUnitPrice(selectedProduct, selectedSize, selectedToppings) * quantity,
              )}
            </button>
          </div>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY (MOBILE BOTTOM NAVIGATION BAR) */}
      {roleMode === 'customer' && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
            zIndex: 90,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '6px 0',
            }}
          >
            {[
              { id: 'menu', label: 'Thực đơn', icon: '🍵' },
              { id: 'cart', label: 'Giỏ hàng', icon: '🛒', badge: totalCartCount },
              { id: 'orders', label: 'Đơn hàng', icon: '📋', badge: orders.length },
              { id: 'auth', label: currentUser ? 'Tài khoản' : 'Đăng nhập', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  background: 'none',
                  border: 'none',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px',
                  cursor: 'pointer',
                  position: 'relative',
                  color: activeTab === tab.id ? '#6f4e37' : '#94a3b8',
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                  }}
                >
                  {tab.label}
                </span>

                {/* BADGE SỐ LƯỢNG */}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: '25%',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: 10,
                      padding: '1px 5px',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
