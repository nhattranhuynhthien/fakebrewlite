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
// 2. HELPER FUNCTIONS (TEST WEB-T01 & E2E-T01)
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
// 3. MAIN COMPONENT (PHỐI MÀU SANG TRỌNG: BLUE BOTTLE & STARBUCKS RESERVE)
// ==========================================
export default function MenuView() {
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'account'>('menu');
  const [serviceType, setServiceType] = useState<'pickup' | 'delivery'>('pickup');

  // Dữ liệu sản phẩm & tìm kiếm
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Modal tùy biến món
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [itemNote, setItemNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);

  // Xác thực người dùng
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string } | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Đơn hàng & thanh toán
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

  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Không thể tải thực đơn`);
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

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

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['Tất cả', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

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
    showToast(` Đã thêm "${drinkName}" vào giỏ hàng`);
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
      showToast(`❌ ${err instanceof Error ? err.message : 'Lỗi xác thực'}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

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
        backgroundColor: '#f1ede4', // Warm Linen background (phong cách cà phê cao cấp)
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* FRAME KHÁCH HÀNG: CHUẨN THIẾT KẾ NORDIC COFFEE */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          backgroundColor: '#faf8f5', // Kem yến mạch ấm áp
          color: '#261b16',
          boxShadow: '0 0 45px rgba(38, 27, 22, 0.08)',
          position: 'relative',
          paddingBottom: 90,
        }}
      >
        {/* TOAST THÔNG BÁO TỐI GIẢN */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: 420,
              backgroundColor: '#261b16',
              color: '#fdfbf7',
              padding: '12px 20px',
              borderRadius: 30,
              fontSize: 13,
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: '0 12px 30px rgba(38, 27, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: -0.2,
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* HEADER: PHONG CÁCH STARBUCKS RESERVE / BLUE BOTTLE */}
        <header
          style={{
            backgroundColor: '#211510',
            color: '#fff',
            padding: '18px 20px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(33, 21, 16, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: '#c49a6c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 4px 12px rgba(196, 154, 108, 0.35)',
                }}
              >
                ☕
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.4, color: '#fcfaf6' }}>
                  BrewLite Specialty
                </h1>
                <p style={{ margin: '1px 0 0', fontSize: 11, color: '#c49a6c', fontWeight: 500 }}>
                  Thủ công • Đậm vị • Tinh tế
                </p>
              </div>
            </div>

            {/* CÔNG TẮC GIAO HÀNG / TẠI QUÁN */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: 3,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <button
                onClick={() => setServiceType('pickup')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: serviceType === 'pickup' ? '#c49a6c' : 'transparent',
                  color: serviceType === 'pickup' ? '#211510' : '#d6c7b2',
                  transition: 'all 0.2s',
                }}
              >
                Tại quầy
              </button>
              <button
                onClick={() => setServiceType('delivery')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: serviceType === 'delivery' ? '#c49a6c' : 'transparent',
                  color: serviceType === 'delivery' ? '#211510' : '#d6c7b2',
                  transition: 'all 0.2s',
                }}
              >
                Giao hàng
              </button>
            </div>
          </div>
        </header>

        {/* NỘI DUNG TỪNG TAB */}
        <main style={{ padding: '16px 18px' }}>
          {/* TAB 1: THỰC ĐƠN ĐỒ UỐNG */}
          {activeTab === 'menu' && (
            <div>
              {/* THANH TÌM KIẾM TINH TẾ */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder="🔍 Bạn đang thèm món đồ uống nào?..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 18px',
                    borderRadius: 14,
                    border: '1px solid #e7ded0',
                    backgroundColor: '#fff',
                    fontSize: 13,
                    color: '#261b16',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(38, 27, 22, 0.03)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: 12,
                      background: 'none',
                      border: 'none',
                      color: '#a89a8c',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* BỘ LỌC DANH MỤC DẠNG VIÊN THUỐC (PILLS) */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 8,
                  marginBottom: 16,
                  scrollbarWidth: 'none',
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 16px',
                      borderRadius: 24,
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? '#211510' : '#e7ded0',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? '#211510' : '#fff',
                      color: selectedCategory === cat ? '#c49a6c' : '#736155',
                      boxShadow: selectedCategory === cat ? '0 4px 12px rgba(33, 21, 16, 0.2)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* TRẠNG THÁI LOADING */}
              {viewState === 'loading' && (
                <div style={{ textAlign: 'center', padding: '50px 16px', color: '#8a796e' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Đang pha chế danh sách đồ uống...</p>
                </div>
              )}

              {/* TRẠNG THÁI ERROR */}
              {viewState === 'error' && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    border: '1px solid #ffe4e6',
                    padding: 18,
                    borderRadius: 16,
                    textAlign: 'center',
                    color: '#9f1239',
                  }}
                >
                  <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600 }}>
                    ⚠️ {error}
                  </p>
                  <button
                    onClick={fetchMenu}
                    style={{
                      backgroundColor: '#e11d48',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Thử kết nối lại
                  </button>
                </div>
              )}

              {/* TRẠNG THÁI EMPTY */}
              {viewState === 'empty' && (
                <div style={{ textAlign: 'center', padding: '50px 16px', color: '#8a796e' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🍃</div>
                  <p style={{ margin: 0, fontSize: 13 }}>Chưa có món nào trong danh mục này.</p>
                </div>
              )}

              {/* DANH SÁCH MÓN ĐỒ UỐNG (CARDS PHỐI MÀU SANG TRỌNG) */}
              {viewState === 'ready' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filteredProducts.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => openCustomizationModal(item)}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 18,
                        padding: 14,
                        display: 'flex',
                        gap: 14,
                        alignItems: 'center',
                        boxShadow: '0 4px 16px rgba(38, 27, 22, 0.04)',
                        border: '1px solid #eee7db',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 14,
                            objectFit: 'cover',
                            backgroundColor: '#f1ede4',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 6,
                            left: 6,
                            backgroundColor: 'rgba(33, 21, 16, 0.85)',
                            backdropFilter: 'blur(4px)',
                            color: '#c49a6c',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            letterSpacing: 0.3,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            margin: '0 0 3px',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#211510',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </h3>
                        <p
                          style={{
                            margin: '0 0 8px',
                            fontSize: 12,
                            color: '#736155',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.35,
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
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#211510' }}>
                            {formatCurrencyVND(item.basePrice)}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: '4px 10px',
                              borderRadius: 14,
                              backgroundColor: item.stock > 0 ? '#f0fdf4' : '#fff1f2',
                              color: item.stock > 0 ? '#15803d' : '#be123c',
                              fontWeight: 700,
                              border: item.stock > 0 ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                            }}
                          >
                            {item.stock > 0 ? `Còn ${item.stock} ly` : 'Tạm hết'}
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
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(38, 27, 22, 0.05)',
                border: '1px solid #eee7db',
              }}
            >
              <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: '#211510' }}>
                🛒 Giỏ hàng của bạn ({totalCartCount} ly)
              </h2>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8a796e' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🛍️</div>
                  <p style={{ margin: '0 0 16px', fontSize: 13 }}>Chưa có ly nào trong giỏ hàng.</p>
                  <button
                    onClick={() => setActiveTab('menu')}
                    style={{
                      backgroundColor: '#211510',
                      color: '#c49a6c',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Khám phá thực đơn ngay
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {cart.map((item) => (
                      <div
                        key={item.cartItemId}
                        style={{
                          display: 'flex',
                          gap: 12,
                          paddingBottom: 14,
                          borderBottom: '1px solid #f2ede4',
                        }}
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          style={{
                            width: 62,
                            height: 62,
                            borderRadius: 12,
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
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#211510' }}>
                                {item.product.name}
                              </h4>
                              <span style={{ fontSize: 11, color: '#c49a6c', fontWeight: 600 }}>
                                Size {item.selectedSize}
                              </span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#211510' }}>
                              {formatCurrencyVND(item.unitPrice * item.quantity)}
                            </span>
                          </div>

                          {item.selectedToppings.length > 0 && (
                            <div style={{ fontSize: 11, color: '#736155', marginTop: 2 }}>
                              + {item.selectedToppings.map((t) => t.name).join(', ')}
                            </div>
                          )}

                          {item.itemNote && (
                            <div style={{ fontSize: 11, color: '#b45309', marginTop: 2, fontStyle: 'italic' }}>
                              📝 {item.itemNote}
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
                                border: '1px solid #dfd5c5',
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
                                  fontWeight: 700,
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
                                color: '#be123c',
                                fontSize: 11,
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PHƯƠNG THỨC THANH TOÁN */}
                  <div style={{ marginTop: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#736155', display: 'block', marginBottom: 8 }}>
                      Phương thức thanh toán:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('WALLET')}
                        style={{
                          padding: '11px 10px',
                          borderRadius: 12,
                          border: paymentMethod === 'WALLET' ? '2px solid #211510' : '1px solid #e7ded0',
                          backgroundColor: paymentMethod === 'WALLET' ? '#faf3eb' : '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          color: '#211510',
                        }}
                      >
                        <span>📱</span> Ví MoMo / ZaloPay
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        style={{
                          padding: '11px 10px',
                          borderRadius: 12,
                          border: paymentMethod === 'CARD' ? '2px solid #211510' : '1px solid #e7ded0',
                          backgroundColor: paymentMethod === 'CARD' ? '#faf3eb' : '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          color: '#211510',
                        }}
                      >
                        <span>💳</span> Thẻ ATM / Visa
                      </button>
                    </div>
                  </div>

                  {/* TỔNG TIỀN VÀ THANH TOÁN */}
                  <div style={{ marginTop: 22, paddingTop: 16, borderTop: '2px dashed #eee7db' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#736155',
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
                        color: '#736155',
                        marginBottom: 14,
                      }}
                    >
                      <span>Ưu đãi thành viên</span>
                      <span style={{ color: '#15803d', fontWeight: 700 }}>Miễn phí (0 đ)</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#211510',
                        marginBottom: 18,
                      }}
                    >
                      <span>Tổng thanh toán:</span>
                      <span style={{ color: '#c49a6c' }}>
                        {formatCurrencyVND(calculateCartTotal(cart))}
                      </span>
                    </div>

                    <button
                      disabled={isCheckingOut}
                      onClick={handleCheckout}
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: 14,
                        backgroundColor: '#211510',
                        color: '#c49a6c',
                        border: 'none',
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 20px rgba(33, 21, 16, 0.3)',
                        opacity: isCheckingOut ? 0.7 : 1,
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {isCheckingOut ? 'Đang giao dịch...' : `Thanh toán ngay • ${formatCurrencyVND(calculateCartTotal(cart))}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
          {activeTab === 'orders' && (
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(38, 27, 22, 0.05)',
                border: '1px solid #eee7db',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#211510' }}>
                  📋 Đơn hàng của bạn
                </h2>
                {jwtToken && (
                  <button
                    onClick={() => fetchMyOrders(jwtToken)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c49a6c',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Cập nhật
                  </button>
                )}
              </div>

              {!jwtToken ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#736155' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 13 }}>
                    Vui lòng đăng nhập để theo dõi quá trình pha chế đồ uống.
                  </p>
                  <button
                    onClick={() => setActiveTab('account')}
                    style={{
                      backgroundColor: '#211510',
                      color: '#c49a6c',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Đăng nhập tài khoản
                  </button>
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8a796e' }}>
                  <p style={{ margin: 0, fontSize: 13 }}>Bạn chưa có đơn hàng nào hôm nay.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        border: '1px solid #eee7db',
                        borderRadius: 14,
                        padding: 16,
                        backgroundColor: '#fcfaf6',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 10,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#211510' }}>
                          Mã đơn: #{ord.id}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: 12,
                            backgroundColor:
                              ord.status === 'PAID'
                                ? '#f0fdf4'
                                : ord.status === 'PREPARING'
                                ? '#fefce8'
                                : ord.status === 'COMPLETED'
                                ? '#eff6ff'
                                : '#f1ede4',
                            color:
                              ord.status === 'PAID'
                                ? '#15803d'
                                : ord.status === 'PREPARING'
                                ? '#a16207'
                                : ord.status === 'COMPLETED'
                                ? '#1d4ed8'
                                : '#736155',
                            border: '1px solid rgba(0,0,0,0.06)',
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

                      {/* STEPPER TIẾN TRÌNH */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: 4,
                          margin: '12px 0',
                          textAlign: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <div
                          style={{
                            padding: '6px',
                            borderRadius: 6,
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                          }}
                        >
                          1. Đã đặt
                        </div>
                        <div
                          style={{
                            padding: '6px',
                            borderRadius: 6,
                            backgroundColor:
                              ord.status === 'PREPARING' || ord.status === 'COMPLETED'
                                ? '#fefce8'
                                : '#f1ede4',
                            color:
                              ord.status === 'PREPARING' || ord.status === 'COMPLETED'
                                ? '#a16207'
                                : '#a89a8c',
                          }}
                        >
                          2. Đang pha
                        </div>
                        <div
                          style={{
                            padding: '6px',
                            borderRadius: 6,
                            backgroundColor: ord.status === 'COMPLETED' ? '#eff6ff' : '#f1ede4',
                            color: ord.status === 'COMPLETED' ? '#1d4ed8' : '#a89a8c',
                          }}
                        >
                          3. Nhận ly
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: '#473831', marginTop: 10 }}>
                        {ord.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
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
                          paddingTop: 10,
                          borderTop: '1px dashed #e7ded0',
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <span>Tổng hóa đơn:</span>
                        <span style={{ color: '#211510' }}>{formatCurrencyVND(ord.totalAmount)}</span>
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
                borderRadius: 20,
                padding: 22,
                boxShadow: '0 4px 20px rgba(38, 27, 22, 0.05)',
                border: '1px solid #eee7db',
              }}
            >
              {currentUser ? (
                <div>
                  <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        backgroundColor: '#211510',
                        color: '#c49a6c',
                        fontSize: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        border: '2px solid #c49a6c',
                      }}
                    >
                      👤
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#211510' }}>
                      {currentUser.fullName}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#736155' }}>{currentUser.email}</p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 8,
                        padding: '4px 12px',
                        borderRadius: 14,
                        backgroundColor: '#faf3eb',
                        color: '#c49a6c',
                        fontSize: 11,
                        fontWeight: 800,
                        border: '1px solid #ebd9c3',
                      }}
                    >
                      ⭐ Hội viên Bạc (120 điểm)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #f2ede4', paddingTop: 18 }}>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{
                        width: '100%',
                        padding: 13,
                        borderRadius: 12,
                        border: '1px solid #e7ded0',
                        backgroundColor: '#fcfaf6',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#211510',
                      }}
                    >
                      <span>📋 Lịch sử đơn hàng của tôi</span>
                      <span>➔</span>
                    </button>

                    <a
                      href="/pos"
                      style={{
                        textDecoration: 'none',
                        padding: 13,
                        borderRadius: 12,
                        border: '1px dashed #c49a6c',
                        backgroundColor: '#faf3eb',
                        color: '#211510',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>🏪 Cổng quầy pha chế Barista (/pos)</span>
                      <span>➔</span>
                    </a>

                    <button
                      onClick={() => {
                        setJwtToken(null);
                        setCurrentUser(null);
                        setMyOrders([]);
                        showToast('Đã đăng xuất tài khoản');
                      }}
                      style={{
                        width: '100%',
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: '#fff1f2',
                        color: '#be123c',
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
                        padding: '11px',
                        borderRadius: 12,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: !isRegisterMode ? '#211510' : '#f2ede4',
                        color: !isRegisterMode ? '#c49a6c' : '#736155',
                      }}
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => setIsRegisterMode(true)}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: 12,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: isRegisterMode ? '#211510' : '#f2ede4',
                        color: isRegisterMode ? '#c49a6c' : '#736155',
                      }}
                    >
                      Đăng ký mới
                    </button>
                  </div>

                  <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {isRegisterMode && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#736155', display: 'block', marginBottom: 5 }}>
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
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid #dfd5c5',
                            fontSize: 13,
                            backgroundColor: '#fcfaf6',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#736155', display: 'block', marginBottom: 5 }}>
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
                          padding: 12,
                          borderRadius: 10,
                          border: '1px solid #dfd5c5',
                          fontSize: 13,
                          backgroundColor: '#fcfaf6',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#736155', display: 'block', marginBottom: 5 }}>
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
                          padding: 12,
                          borderRadius: 10,
                          border: '1px solid #dfd5c5',
                          fontSize: 13,
                          backgroundColor: '#fcfaf6',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingAuth}
                      style={{
                        marginTop: 6,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: '#211510',
                        color: '#c49a6c',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: isSubmittingAuth ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(33, 21, 16, 0.25)',
                      }}
                    >
                      {isSubmittingAuth ? 'Đang xác thực...' : isRegisterMode ? 'Đăng ký & Bắt đầu đặt món' : 'Đăng nhập'}
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
              backgroundColor: 'rgba(33, 21, 16, 0.6)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSelectedProduct(null)}
          >
            <div
              style={{
                backgroundColor: '#fff',
                width: '100%',
                maxWidth: 480,
                padding: '22px 20px 30px',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#211510' }}>
                    {selectedProduct.name}
                  </h3>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#736155', lineHeight: 1.35 }}>
                    {selectedProduct.description}
                  </p>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#211510' }}>
                    {formatCurrencyVND(selectedProduct.basePrice)}
                  </span>
                </div>
              </div>

              {/* CHỌN SIZE */}
              {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#736155', display: 'block', marginBottom: 8 }}>
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
                          padding: '11px 8px',
                          borderRadius: 12,
                          border: selectedSize === s.name ? '2px solid #211510' : '1px solid #dfd5c5',
                          backgroundColor: selectedSize === s.name ? '#faf3eb' : '#fff',
                          color: selectedSize === s.name ? '#211510' : '#736155',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Size {s.name}
                        <span style={{ display: 'block', fontSize: 11, color: '#c49a6c', marginTop: 2 }}>
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
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#736155', display: 'block', marginBottom: 8 }}>
                    Thêm Topping yêu thích:
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
                            padding: '11px 14px',
                            borderRadius: 12,
                            border: isChecked ? '1.5px solid #211510' : '1px solid #dfd5c5',
                            backgroundColor: isChecked ? '#faf3eb' : '#fff',
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontWeight: isChecked ? 700 : 500 }}>{top.name}</span>
                          <span style={{ color: '#211510', fontWeight: 700 }}>
                            +{formatCurrencyVND(top.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GHI CHÚ CHO BARISTA */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#736155', display: 'block', marginBottom: 6 }}>
                  Ghi chú pha chế:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 30% đường, ít đá, nhiều kem..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 11,
                    borderRadius: 10,
                    border: '1px solid #dfd5c5',
                    fontSize: 12,
                    backgroundColor: '#fcfaf6',
                  }}
                />
              </div>

              {/* BỘ SỐ LƯỢNG */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 22,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800 }}>Số lượng:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #dfd5c5',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: '#f1ede4',
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
                      fontWeight: 800,
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
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: '#f1ede4',
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
                  padding: '15px',
                  borderRadius: 14,
                  backgroundColor: '#211510',
                  color: '#c49a6c',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(33, 21, 16, 0.3)',
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

        {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY (MOBILE BOTTOM NAV) */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #eee7db',
            boxShadow: '0 -4px 20px rgba(38, 27, 22, 0.06)',
            zIndex: 90,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '8px 0',
            }}
          >
            {[
              { id: 'menu', label: 'Thực đơn', icon: '🍵' },
              { id: 'cart', label: 'Giỏ hàng', icon: '🛒', badge: totalCartCount },
              { id: 'orders', label: 'Đơn của tôi', icon: '📋', badge: myOrders.length },
              { id: 'account', label: currentUser ? 'Hội viên' : 'Tài khoản', icon: '👤' },
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
                  gap: 3,
                  padding: '4px',
                  cursor: 'pointer',
                  position: 'relative',
                  color: activeTab === tab.id ? '#211510' : '#a89a8c',
                }}
              >
                <span style={{ fontSize: 19 }}>{tab.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    color: activeTab === tab.id ? '#211510' : '#8a796e',
                  }}
                >
                  {tab.label}
                </span>

                {Boolean(tab.badge && tab.badge > 0) && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 1,
                      right: '25%',
                      backgroundColor: '#be123c',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: 10,
                      padding: '1px 6px',
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
