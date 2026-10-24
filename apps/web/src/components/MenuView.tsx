'use client';

import React, { useEffect, useState, useMemo } from 'react';

// ==========================================
// 1. DATA TYPES (KIỂU DỮ LIỆU)
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
  itemNote?: string;
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
// 3. MAIN COMPONENT (GIAO DIỆN KHÁCH HÀNG THỰC TẾ)
// ==========================================
export default function MenuView() {
  // Tab điều hướng khách hàng: 'menu' | 'cart' | 'orders' | 'account'
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'account'>('menu');

  // Phương thức phục vụ: 'pickup' (Mang đi/Tại quầy) hoặc 'delivery' (Giao hàng)
  const [serviceType, setServiceType] = useState<'pickup' | 'delivery'>('pickup');

  // Danh sách sản phẩm & tìm kiếm
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Modal tùy biến món (Size, Topping, Ghi chú)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [itemNote, setItemNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);

  // Người dùng & Xác thực (Auth)
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string } | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Thanh toán & Đơn hàng của khách
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [myOrders, setMyOrders] = useState<OrderRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Nhận diện URL API chuẩn
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
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tải danh sách menu từ backend
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

  // Tải danh sách đơn hàng của riêng khách hàng này
  const fetchMyOrders = async (token: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: OrderRecord[] = await res.json();
        setMyOrders(data);
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

  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Mở modal tùy biến món
  const openCustomizationModal = (item: Product) => {
    setSelectedProduct(item);
    const defaultSize = item.availableSizes?.[0]?.name || 'S';
    setSelectedSize(defaultSize);
    setSelectedToppings([]);
    setItemNote('');
    setQuantity(1);
  };

  const toggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping],
    );
  };

  // Thêm món vào giỏ hàng
  const addToCart = () => {
    if (!selectedProduct) return;
    const unitPrice = calculateUnitPrice(selectedProduct, selectedSize, selectedToppings);
    const newItem: CartItem = {
      cartItemId: `${selectedProduct.id}-${selectedSize}-${selectedToppings.map((t) => t.id).sort().join(',')}-${itemNote.trim()}`,
      product: selectedProduct,
      quantity,
      selectedSize,
      selectedToppings,
      itemNote: itemNote.trim() || undefined,
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
    showToast(` Đã thêm "${drinkName}" vào giỏ hàng!`);
  };

  // Tăng giảm số lượng trong giỏ
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

  // Xử lý Đăng nhập / Đăng ký thực tế
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showToast('⚠️ Vui lòng điền email và mật khẩu');
      return;
    }
    setIsSubmittingAuth(true);
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
      showToast(` ${err instanceof Error ? err.message : 'Lỗi xác thực'}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Đặt hàng & thanh toán thực tế
  const handleCheckout = async () => {
    if (!jwtToken) {
      showToast('⚠️ Vui lòng đăng nhập để tiến hành đặt hàng');
      setActiveTab('account');
      return;
    }
    if (cart.length === 0) {
      showToast('⚠️ Giỏ hàng của bạn đang trống');
      return;
    }

    setIsCheckingOut(true);
    showToast(' Đang xử lý giao dịch thanh toán an toàn...');
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
      showToast(` Đặt hàng thành công! Đơn hàng #${data.order.id}`);
      await fetchMenu();
      await fetchMyOrders(jwtToken);
      setActiveTab('orders');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Thanh toán thất bại'}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const viewState = resolveMenuViewState(isLoading, error, products);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#e2e8f0',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* FRAME KHÁCH HÀNG CHUẨN THIẾT KẾ DI ĐỘNG (MOBILE CONTAINER) */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          color: '#1e293b',
          boxShadow: '0 0 35px rgba(0,0,0,0.1)',
          position: 'relative',
          paddingBottom: 85,
        }}
      >
        {/* TOAST THÔNG BÁO TỨC THÌ */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: 420,
              backgroundColor: '#1e293b',
              color: '#fff',
              padding: '12px 18px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 500,
              zIndex: 9999,
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* HEADER KHÁCH HÀNG THỰC TẾ & CHUYÊN NGHIỆP */}
        <header
          style={{
            background: 'linear-gradient(135deg, #3f271a 0%, #6f4e37 100%)',
            color: '#fff',
            padding: '16px 20px 18px',
            boxShadow: '0 4px 16px rgba(111,78,55,0.2)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>☕</span>
              <div>
                <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>
                  BrewLite Coffee & Tea
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85 }}>
                  Thưởng thức từng ngụm đậm vị • Đặt món nhanh
                </p>
              </div>
            </div>

            {/* CHỌN PHƯƠNG THỨC MANG ĐI / GIAO HÀNG */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: 2,
                borderRadius: 16,
              }}
            >
              <button
                onClick={() => setServiceType('pickup')}
                style={{
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: serviceType === 'pickup' ? '#fff' : 'transparent',
                  color: serviceType === 'pickup' ? '#6f4e37' : '#fff',
                }}
              >
                Tại quầy
              </button>
              <button
                onClick={() => setServiceType('delivery')}
                style={{
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: serviceType === 'delivery' ? '#fff' : 'transparent',
                  color: serviceType === 'delivery' ? '#6f4e37' : '#fff',
                }}
              >
                Giao hàng
              </button>
            </div>
          </div>
        </header>

        {/* NỘI DUNG TỪNG TAB KHÁCH HÀNG */}
        <main style={{ padding: '16px' }}>
          {/* TAB 1: THỰC ĐƠN ĐỒ UỐNG (MENU) */}
          {activeTab === 'menu' && (
            <div>
              {/* THANH TÌM KIẾM MÓN */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="🔍 Bạn muốn uống gì hôm nay? (Trà sữa, cà phê...)"
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
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* BỘ LỌC DANH MỤC */}
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
                      padding: '7px 15px',
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
                <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                  <p style={{ margin: 0, fontSize: 14 }}>Đang nạp thực đơn đồ uống...</p>
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
                    ⚠️ Không thể tải thực đơn: {error}
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
                    Tải lại thực đơn
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

          {/* TAB 2: GIỎ HÀNG (SHOPPING CART) */}
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
                    Xem thực đơn ngay
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

                          {item.itemNote && (
                            <div style={{ fontSize: 11, color: '#d97706', marginTop: 2, fontStyle: 'italic' }}>
                              Ghi chú: {item.itemNote}
                            </div>
                          )}

                          {/* BỘ ĐẾM SỐ LƯỢNG */}
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
                        <span>📱</span> Ví MoMo / ZaloPay
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
                        <span>💳</span> Thẻ ATM / Visa
                      </button>
                    </div>
                  </div>

                  {/* TỔNG TIỀN & XÁC NHẬN THANH TOÁN */}
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
                      <span>Ưu đãi hội viên</span>
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
                      disabled={isCheckingOut}
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
                        cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                        opacity: isCheckingOut ? 0.7 : 1,
                      }}
                    >
                      {isCheckingOut ? 'Đang xác thực giao dịch...' : `Thanh toán ngay • ${formatCurrencyVND(calculateCartTotal(cart))}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: ĐƠN HÀNG CỦA TÔI (MY ORDERS) */}
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
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📋 Đơn hàng của bạn</h2>
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
                    Vui lòng đăng nhập để theo dõi trạng thái đơn hàng của bạn.
                  </p>
                  <button
                    onClick={() => setActiveTab('account')}
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
                    Đăng nhập tài khoản
                  </button>
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: 13 }}>Bạn chưa có đơn hàng nào hôm nay.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {myOrders.map((ord) => (
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

                      {/* TIẾN TRÌNH TRẠNG THÁI (STEPPER) */}
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
                          2. Đang làm
                        </div>
                        <div
                          style={{
                            padding: '4px',
                            borderRadius: 4,
                            backgroundColor: ord.status === 'COMPLETED' ? '#eff6ff' : '#f1f5f9',
                            color: ord.status === 'COMPLETED' ? '#2563eb' : '#94a3b8',
                          }}
                        >
                          3. Nhận đồ
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                        {ord.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
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

          {/* TAB 4: TÀI KHOẢN (ACCOUNT / AUTH) */}
          {activeTab === 'account' && (
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              {currentUser ? (
                <div>
                  <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: '#6f4e37',
                        color: '#fff',
                        fontSize: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}
                    >
                      👤
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>
                      {currentUser.fullName}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{currentUser.email}</p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 8,
                        padding: '3px 10px',
                        borderRadius: 12,
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ⭐ Thành viên Bạc (120 điểm)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>📋 Lịch sử đơn hàng của tôi</span>
                      <span>➔</span>
                    </button>

                    <a
                      href="/pos"
                      style={{
                        textDecoration: 'none',
                        padding: 12,
                        borderRadius: 10,
                        border: '1px dashed #cbd5e1',
                        backgroundColor: '#fdf8f6',
                        color: '#6f4e37',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>🏪 Cổng nhân viên quầy Barista (/pos)</span>
                      <span>➔</span>
                    </a>

                    <button
                      onClick={() => {
                        setJwtToken(null);
                        setCurrentUser(null);
                        setMyOrders([]);
                        showToast('Đã đăng xuất thành công');
                      }}
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 10,
                        border: 'none',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Đăng xuất tài khoản
                    </button>
                  </div>
                </div>
              ) : (
                <div>
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
                      Đăng ký tài khoản
                    </button>
                  </div>

                  <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isRegisterMode && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                          Họ và tên của bạn:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: 11,
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
                          padding: 11,
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
                        placeholder="Mật khẩu bảo mật"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: 11,
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingAuth}
                      style={{
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 10,
                        backgroundColor: '#6f4e37',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: isSubmittingAuth ? 'not-allowed' : 'pointer',
                        opacity: isSubmittingAuth ? 0.7 : 1,
                      }}
                    >
                      {isSubmittingAuth ? 'Đang xác thực...' : isRegisterMode ? 'Tạo tài khoản & Đăng nhập' : 'Đăng nhập'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL TÙY CHỌN SIZE & TOPPING (BOTTOM SHEET) */}
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
                <div style={{ marginBottom: 16 }}>
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

              {/* GHI CHÚ CHO QUÁN */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  Ghi chú cho Barista (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: ít đường, nhiều đá, uống nóng..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                  }}
                />
              </div>

              {/* SỐ LƯỢNG LY */}
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

        {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY CỦA KHÁCH (MOBILE BOTTOM NAV) */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#fff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            zIndex: 90,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '6px 0',
            }}
          >
            {[
              { id: 'menu', label: 'Thực đơn', icon: '🍵' },
              { id: 'cart', label: 'Giỏ hàng', icon: '🛒', badge: totalCartCount },
              { id: 'orders', label: 'Đơn của tôi', icon: '📋', badge: myOrders.length },
              { id: 'account', label: currentUser ? 'Tài khoản' : 'Đăng nhập', icon: '👤' },
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

                {/* HUY HIỆU ĐẾM SỐ LƯỢNG */}
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
      </div>
    </div>
  );
}
