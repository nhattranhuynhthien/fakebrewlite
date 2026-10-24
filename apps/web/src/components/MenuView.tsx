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
// 3. MAIN COMPONENT (PHỐI MÀU: THE COFFEE HOUSE / PHÚC LONG & FULL-WIDTH RESPONSIVE)
// ==========================================
export default function MenuView() {
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'account'>('menu');
  const [serviceType, setServiceType] = useState<'delivery' | 'pickup'>('delivery');

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

  // Nhận diện URL API
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Không thể nạp danh sách đồ uống`);
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối máy chủ API. Vui lòng thử lại sau giây lát.',
      );
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
      // Bỏ qua lỗi ngầm khi tải danh sách đơn
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

  const closeCustomizationModal = () => {
    setSelectedProduct(null);
  };

  const toggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) return prev.filter((t) => t.id !== topping.id);
      return [...prev, topping];
    });
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const unitPrice = calculateUnitPrice(selectedProduct, selectedSize, selectedToppings);
    const toppingKey = selectedToppings.map((t) => t.id).sort().join('-');
    const cartItemId = `${selectedProduct.id}-${selectedSize}-${toppingKey}-${itemNote || 'none'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          product: selectedProduct,
          quantity,
          selectedSize,
          selectedToppings,
          itemNote: itemNote.trim() || undefined,
          unitPrice,
        },
      ];
    });

    showToast(`Đã thêm ${quantity}x "${selectedProduct.name}" vào giỏ hàng`);
    closeCustomizationModal();
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
    const payload = isRegisterMode
      ? { email: authEmail, password: authPassword, fullName: authFullName }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Xác thực không thành công');
      }

      setJwtToken(data.accessToken);
      setCurrentUser({
        email: data.user?.email || authEmail,
        fullName: data.user?.fullName || 'Khách hàng thân thiết',
      });
      showToast(isRegisterMode ? 'Đăng ký thành viên thành công!' : 'Đăng nhập thành công!');
      fetchMyOrders(data.accessToken);
      setActiveTab('menu');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi hệ thống');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!jwtToken) {
      alert('Vui lòng đăng nhập hoặc tạo tài khoản để hoàn tất đặt hàng!');
      setActiveTab('account');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderPayload = {
        paymentMethod,
        idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedToppings: item.selectedToppings.map((t) => t.id),
        })),
      };

      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đặt hàng thất bại');
      }

      setCart([]);
      showToast('🎉 Đặt hàng thành công! Đơn hàng đang được pha chế.');
      await fetchMyOrders(jwtToken);
      await fetchMenu();
      setActiveTab('orders');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Có lỗi trong quá trình thanh toán');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return calculateCartTotal(cart);
  }, [cart]);

  const currentModalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return calculateUnitPrice(selectedProduct, selectedSize, selectedToppings) * quantity;
  }, [selectedProduct, selectedSize, selectedToppings, quantity]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#faf7f2', // Warm cream soft background
        color: '#29140b', // Roasted coffee brown text
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ea580c',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER / NAVIGATION (FULL-WIDTH RESPONSIVE) */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #fed7aa',
          boxShadow: '0 2px 12px rgba(234, 88, 12, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* LOGO & BRAND */}
          <div
            onClick={() => setActiveTab('menu')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              ☕
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#431407',
                  letterSpacing: '-0.3px',
                }}
              >
                BrewLite Coffee & Tea
              </div>
              <div style={{ fontSize: 11, color: '#9a3412', fontWeight: 600 }}>
                Đậm vị nguyên bản • Giao nhanh 15 phút
              </div>
            </div>
          </div>

          {/* SERVICE TYPE TOGGLE (GIAO HÀNG / TẠI QUÁN) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#fff7ed',
              padding: 4,
              borderRadius: 24,
              border: '1px solid #ffedd5',
            }}
          >
            <button
              onClick={() => setServiceType('delivery')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: serviceType === 'delivery' ? '#ea580c' : 'transparent',
                color: serviceType === 'delivery' ? '#ffffff' : '#7c2d12',
                transition: 'all 0.2s',
              }}
            >
              🛵 Giao tận nơi
            </button>
            <button
              onClick={() => setServiceType('pickup')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: serviceType === 'pickup' ? '#ea580c' : 'transparent',
                color: serviceType === 'pickup' ? '#ffffff' : '#7c2d12',
                transition: 'all 0.2s',
              }}
            >
              🛍️ Mang đi / Tại bàn
            </button>
          </div>

          {/* DESKTOP NAV TABS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setActiveTab('menu')}
              style={{
                border: 'none',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'menu' ? '#ea580c' : '#fff7ed',
                color: activeTab === 'menu' ? '#fff' : '#431407',
              }}
            >
              🍵 Thực đơn
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                border: 'none',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'orders' ? '#ea580c' : '#fff7ed',
                color: activeTab === 'orders' ? '#fff' : '#431407',
              }}
            >
              📋 Đơn của tôi {myOrders.length > 0 && `(${myOrders.length})`}
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              style={{
                border: 'none',
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'cart' ? '#c2410c' : '#ea580c',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
              }}
            >
              <span>🛒 Giỏ hàng</span>
              {totalCartCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#fff',
                    color: '#ea580c',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: 12,
                  }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('account')}
              style={{
                border: '1px solid #fed7aa',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === 'account' ? '#431407' : '#ffffff',
                color: activeTab === 'account' ? '#fff' : '#431407',
              }}
            >
              👤 {currentUser ? currentUser.fullName.split(' ')[0] : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 80px' }}>
        {/* ==================================================== */}
        {/* TAB 1: MENU & SẢN PHẨM (FULL-WIDTH 3 - 4 CỘT TRÊN PC) */}
        {/* ==================================================== */}
        {activeTab === 'menu' && (
          <div>
            {/* HERO BANNER & TÌM KIẾM */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: '1px solid #fed7aa',
                borderRadius: 20,
                padding: '28px 24px',
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#431407',
                  }}
                >
                  Hôm nay bạn muốn thưởng thức món gì? 🥤
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: '#7c2d12' }}>
                  Trà sữa thơm béo chuẩn vị Đài Loan, Cà phê muối đậm đà và Trà đào cam sả thanh mát.
                </p>
              </div>

              {/* Ô TÌM KIẾM SẢN PHẨM */}
              <div style={{ minWidth: 300, flex: 1, maxWidth: 420 }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm món (Ô long, cà phê muối, trà đào...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 18px',
                    borderRadius: 24,
                    border: '1px solid #fdba74',
                    backgroundColor: '#fff',
                    fontSize: 13,
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                  }}
                />
              </div>
            </div>

            {/* THANH DANH MỤC SẢN PHẨM */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                paddingBottom: 10,
                marginBottom: 24,
                scrollbarWidth: 'none',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '9px 20px',
                    borderRadius: 24,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat ? '#ea580c' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#431407',
                    boxShadow:
                      selectedCategory === cat
                        ? '0 4px 14px rgba(234, 88, 12, 0.3)'
                        : '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* TRẠNG THÁI LOADING / ERROR */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a3412' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                <p style={{ margin: 0, fontWeight: 700 }}>Đang tải danh mục đồ uống tươi mới...</p>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 16,
                  padding: 24,
                  textAlign: 'center',
                  color: '#991b1b',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{error}</div>
                <button
                  onClick={fetchMenu}
                  style={{
                    marginTop: 10,
                    padding: '8px 20px',
                    borderRadius: 20,
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Tải lại thực đơn
                </button>
              </div>
            )}

            {/* LƯỚI SẢN PHẨM ĐẦY ĐỦ 3 - 4 CỘT TRÊN PC */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7c2d12' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  Không tìm thấy đồ uống nào phù hợp với từ khóa này.
                </p>
              </div>
            )}

            {!isLoading && !error && filteredProducts.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 22,
                }}
              >
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: '1px solid #ffedd5',
                      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* HÌNH ẢNH SẢN PHẨM */}
                    <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: '#ffedd5',
                        }}
                      />
                      {/* BADGE DANH MỤC */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: 'rgba(43, 20, 11, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 12,
                        }}
                      >
                        {item.category}
                      </span>

                      {/* BADGE TỒN KHO */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor:
                            item.stock > 10 ? 'rgba(21, 128, 61, 0.9)' : 'rgba(234, 88, 12, 0.9)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 10,
                        }}
                      >
                        {item.stock > 0 ? `Còn ${item.stock} ly` : 'Tạm hết'}
                      </span>
                    </div>

                    {/* NỘI DUNG SẢN PHẨM */}
                    <div
                      style={{
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: 16,
                            fontWeight: 800,
                            color: '#431407',
                          }}
                        >
                          {item.name}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#7c2d12',
                            lineHeight: 1.45,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* GIÁ TIỀN & NÚT THÊM */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 16,
                          paddingTop: 12,
                          borderTop: '1px solid #fff7ed',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 10, color: '#9a3412', fontWeight: 600 }}>
                            Giá từ
                          </div>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 900,
                              color: '#ea580c',
                            }}
                          >
                            {formatCurrencyVND(item.basePrice)}
                          </div>
                        </div>

                        <button
                          onClick={() => openCustomizationModal(item)}
                          style={{
                            backgroundColor: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          + Thêm món
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: GIỎ HÀNG & THANH TOÁN (RESPONSIVE CHIA 2 CỘT PC) */}
        {/* ==================================================== */}
        {activeTab === 'cart' && (
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#431407',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🛒 Giỏ Hàng Của Bạn</span>
              <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
                ({totalCartCount} món)
              </span>
            </h2>

            {cart.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: '60px 20px',
                  textAlign: 'center',
                  border: '1px solid #ffedd5',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧺</div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 800, color: '#431407' }}>
                  Giỏ hàng đang trống
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#7c2d12' }}>
                  Hãy chọn cho mình một món đồ uống yêu thích nhé!
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 24,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)',
                  }}
                >
                  Khám phá thực đơn ngay
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 24,
                  alignItems: 'start',
                }}
              >
                {/* CỘT TRÁI: DANH SÁCH MÓN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 16,
                        padding: 16,
                        border: '1px solid #ffedd5',
                        display: 'flex',
                        gap: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          objectFit: 'cover',
                          backgroundColor: '#ffedd5',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                          }}
                        >
                          <h4
                            style={{
                              margin: '0 0 4px 0',
                              fontSize: 15,
                              fontWeight: 800,
                              color: '#431407',
                            }}
                          >
                            {item.product.name}
                          </h4>
                          <span style={{ fontSize: 15, fontWeight: 900, color: '#ea580c' }}>
                            {formatCurrencyVND(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: '#7c2d12', marginBottom: 4 }}>
                          Size: <strong>{item.selectedSize}</strong>
                          {item.selectedToppings.length > 0 && (
                            <span>
                              {' '}
                              • Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                            </span>
                          )}
                        </div>

                        {item.itemNote && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#9a3412',
                              backgroundColor: '#fff7ed',
                              padding: '2px 8px',
                              borderRadius: 6,
                              display: 'inline-block',
                              marginBottom: 8,
                            }}
                          >
                            📝 {item.itemNote}
                          </div>
                        )}

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
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: 8,
                              backgroundColor: '#fff7ed',
                              border: '1px solid #fed7aa',
                            }}
                          >
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, -1)}
                              style={{
                                padding: '4px 10px',
                                border: 'none',
                                background: 'transparent',
                                fontWeight: 800,
                                cursor: 'pointer',
                                color: '#431407',
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                padding: '4px 10px',
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#431407',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, 1)}
                              style={{
                                padding: '4px 10px',
                                border: 'none',
                                background: 'transparent',
                                fontWeight: 800,
                                cursor: 'pointer',
                                color: '#431407',
                              }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, -item.quantity)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#dc2626',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CỘT PHẢI: TỔNG KẾT & XÁC NHẬN THANH TOÁN */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 18,
                    padding: 24,
                    border: '1px solid #fed7aa',
                    boxShadow: '0 4px 18px rgba(234, 88, 12, 0.08)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 16px 0',
                      fontSize: 17,
                      fontWeight: 800,
                      color: '#431407',
                    }}
                  >
                    Thông Tin Thanh Toán
                  </h3>

                  {/* PHƯƠNG THỨC THANH TOÁN */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#7c2d12',
                        marginBottom: 8,
                      }}
                    >
                      Phương thức thanh toán:
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => setPaymentMethod('WALLET')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 12,
                          border:
                            paymentMethod === 'WALLET'
                              ? '2px solid #ea580c'
                              : '1px solid #fed7aa',
                          backgroundColor: paymentMethod === 'WALLET' ? '#fff7ed' : '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#431407',
                          cursor: 'pointer',
                        }}
                      >
                        💳 Ví BrewPay
                      </button>
                      <button
                        onClick={() => setPaymentMethod('CARD')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 12,
                          border:
                            paymentMethod === 'CARD'
                              ? '2px solid #ea580c'
                              : '1px solid #fed7aa',
                          backgroundColor: paymentMethod === 'CARD' ? '#fff7ed' : '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#431407',
                          cursor: 'pointer',
                        }}
                      >
                        🏦 Thẻ ATM / QR
                      </button>
                    </div>
                  </div>

                  {/* BẢNG TÍNH TIỀN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#7c2d12' }}>Tạm tính</span>
                      <span style={{ fontWeight: 700, color: '#431407' }}>
                        {formatCurrencyVND(totalCartAmount)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#7c2d12' }}>Phí vận chuyển</span>
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>Miễn phí (0 đ)</span>
                    </div>
                    <div
                      style={{
                        height: 1,
                        backgroundColor: '#ffedd5',
                        margin: '6px 0',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                      <span style={{ fontWeight: 800, color: '#431407' }}>Tổng thanh toán</span>
                      <span style={{ fontWeight: 900, color: '#ea580c', fontSize: 18 }}>
                        {formatCurrencyVND(totalCartAmount)}
                      </span>
                    </div>
                  </div>

                  {/* NÚT HOÀN TẤT ĐẶT HÀNG */}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    style={{
                      width: '100%',
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      padding: 16,
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                      boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
                      opacity: isCheckingOut ? 0.7 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCheckingOut ? 'Đang xác nhận đơn hàng...' : `Đặt Hàng Ngay • ${formatCurrencyVND(totalCartAmount)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TIẾN ĐỘ ĐƠN HÀNG (ORDER TRACKING TIMELINE) */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#431407',
                marginBottom: 20,
              }}
            >
              📋 Lịch Sử & Trạng Thái Đơn Hàng
            </h2>

            {!jwtToken ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: '48px 20px',
                  textAlign: 'center',
                  border: '1px solid #ffedd5',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#431407' }}>
                  Vui lòng đăng nhập để xem đơn hàng
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#7c2d12' }}>
                  Đăng nhập để theo dõi trực tiếp trạng thái Barista đang pha chế ly nước của bạn.
                </p>
                <button
                  onClick={() => setActiveTab('account')}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : myOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: '48px 20px',
                  textAlign: 'center',
                  border: '1px solid #ffedd5',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#431407' }}>
                  Bạn chưa có đơn hàng nào
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#7c2d12' }}>
                  Các đơn hàng sau khi đặt thành công sẽ xuất hiện tại đây kèm thời gian thực.
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Đặt món ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {myOrders.map((order) => {
                  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                    PENDING: { label: 'Chờ thanh toán', color: '#b45309', bg: '#fef3c7' },
                    PAID: { label: 'Đã thanh toán • Chờ pha chế', color: '#0369a1', bg: '#e0f2fe' },
                    PREPARING: { label: 'Barista đang pha chế 🧋', color: '#ea580c', bg: '#fff7ed' },
                    COMPLETED: { label: 'Đã hoàn thành • Mời nhận món ✨', color: '#15803d', bg: '#dcfce7' },
                    CANCELLED: { label: 'Đã hủy', color: '#b91c1c', bg: '#fee2e2' },
                  };
                  const currentStatus = statusMap[order.status] || {
                    label: order.status,
                    color: '#475569',
                    bg: '#f1f5f9',
                  };

                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 18,
                        padding: 20,
                        border: '1px solid #fed7aa',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          marginBottom: 14,
                          paddingBottom: 12,
                          borderBottom: '1px solid #fff7ed',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>
                            Mã đơn: #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 10 }}>
                            {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            padding: '4px 12px',
                            borderRadius: 14,
                            color: currentStatus.color,
                            backgroundColor: currentStatus.bg,
                          }}
                        >
                          {currentStatus.label}
                        </span>
                      </div>

                      {/* TIẾN ĐỘ TRẠNG THÁI */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 16,
                          padding: '10px 14px',
                          backgroundColor: '#fffaf5',
                          borderRadius: 12,
                        }}
                      >
                        {['PAID', 'PREPARING', 'COMPLETED'].map((step, idx) => {
                          const isDone =
                            (order.status === 'PAID' && idx === 0) ||
                            (order.status === 'PREPARING' && idx <= 1) ||
                            order.status === 'COMPLETED';
                          return (
                            <React.Fragment key={step}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontSize: 11,
                                  fontWeight: isDone ? 800 : 500,
                                  color: isDone ? '#ea580c' : '#9ca3af',
                                }}
                              >
                                <span>{isDone ? '●' : '○'}</span>
                                <span>
                                  {step === 'PAID'
                                    ? 'Đã nhận'
                                    : step === 'PREPARING'
                                      ? 'Pha chế'
                                      : 'Hoàn thành'}
                                </span>
                              </div>
                              {idx < 2 && (
                                <div
                                  style={{
                                    flex: 1,
                                    height: 2,
                                    backgroundColor: isDone ? '#ea580c' : '#fed7aa',
                                  }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* CHI TIẾT MÓN TRONG ĐƠN */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.items?.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 13,
                            }}
                          >
                            <span style={{ color: '#431407' }}>
                              <strong>{item.quantity}x</strong> {item.productName} (Size{' '}
                              {item.selectedSize})
                            </span>
                            <span style={{ fontWeight: 700, color: '#7c2d12' }}>
                              {formatCurrencyVND(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: '1px solid #fff7ed',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#7c2d12' }}>
                          Tổng hóa đơn
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#ea580c' }}>
                          {formatCurrencyVND(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: TÀI KHOẢN KHÁCH HÀNG (AUTH & PROFILE) */}
        {/* ==================================================== */}
        {activeTab === 'account' && (
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            {currentUser ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: 28,
                  border: '1px solid #fed7aa',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: '#fff7ed',
                    color: '#ea580c',
                    fontSize: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '2px solid #fed7aa',
                  }}
                >
                  👤
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800, color: '#431407' }}>
                  {currentUser.fullName}
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#7c2d12' }}>
                  {currentUser.email}
                </p>

                <div
                  style={{
                    backgroundColor: '#fff7ed',
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 20,
                    fontSize: 12,
                    color: '#9a3412',
                    textAlign: 'left',
                  }}
                >
                  <strong>✨ Hội viên BrewLite Member:</strong> Bạn nhận được quyền lợi tích điểm và
                  ưu đãi độc quyền cho mỗi đơn đồ uống.
                </div>

                <button
                  onClick={() => {
                    setJwtToken(null);
                    setCurrentUser(null);
                    showToast('Đã đăng xuất');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 14,
                    border: '1px solid #fed7aa',
                    backgroundColor: '#fff',
                    color: '#dc2626',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 20,
                  padding: 28,
                  border: '1px solid #fed7aa',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
                  <h3
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#431407',
                    }}
                  >
                    {isRegisterMode ? 'Đăng Ký Hội Viên Mới' : 'Đăng Nhập BrewLite'}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#7c2d12' }}>
                    Tích điểm đổi món và theo dõi đơn hàng thời gian thực
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {isRegisterMode && (
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#431407',
                          marginBottom: 4,
                        }}
                      >
                        Họ và tên:
                      </label>
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #fed7aa',
                          fontSize: 13,
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#431407',
                        marginBottom: 4,
                      }}
                    >
                      Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="customer@brewlite.vn"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #fed7aa',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#431407',
                        marginBottom: 4,
                      }}
                    >
                      Mật khẩu:
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #fed7aa',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 14,
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: 6,
                    }}
                  >
                    {isSubmittingAuth
                      ? 'Đang xử lý...'
                      : isRegisterMode
                        ? 'Tạo tài khoản'
                        : 'Đăng nhập'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isRegisterMode
                      ? 'Đã có tài khoản? Đăng nhập tại đây'
                      : 'Chưa có tài khoản? Đăng ký ngay'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL TÙY BIẾN MÓN (SIZE, TOPPING, GHI CHÚ) */}
      {/* ==================================================== */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 20, 11, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              padding: 24,
            }}
          >
            {/* NÚT ĐÓNG */}
            <button
              onClick={closeCustomizationModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#fff7ed',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                color: '#431407',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            {/* THÔNG TIN MÓN */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 16,
                  objectFit: 'cover',
                  backgroundColor: '#ffedd5',
                }}
              />
              <div>
                <h3
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#431407',
                  }}
                >
                  {selectedProduct.name}
                </h3>
                <p style={{ margin: '0 0 6px 0', fontSize: 12, color: '#7c2d12' }}>
                  {selectedProduct.description}
                </p>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#ea580c' }}>
                  {formatCurrencyVND(selectedProduct.basePrice)}
                </div>
              </div>
            </div>

            {/* CHỌN SIZE */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#431407',
                  marginBottom: 8,
                }}
              >
                Chọn kích cỡ (Size):
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {selectedProduct.availableSizes?.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedSize(size.name)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: 12,
                      border:
                        selectedSize === size.name ? '2px solid #ea580c' : '1px solid #fed7aa',
                      backgroundColor: selectedSize === size.name ? '#fff7ed' : '#ffffff',
                      color: selectedSize === size.name ? '#ea580c' : '#431407',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>Size {size.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                      {size.priceDelta > 0 ? `+${formatCurrencyVND(size.priceDelta)}` : 'Mặc định'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CHỌN TOPPING */}
            {selectedProduct.availableToppings && selectedProduct.availableToppings.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#431407',
                    marginBottom: 8,
                  }}
                >
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
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: isChecked ? '2px solid #ea580c' : '1px solid #ffedd5',
                          backgroundColor: isChecked ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#431407' }}>
                          {isChecked ? '☑ ' : '☐ '}
                          {top.name}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#ea580c' }}>
                          +{formatCurrencyVND(top.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GHI CHÚ */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#431407',
                  marginBottom: 6,
                }}
              >
                Ghi chú cho Barista (Ít ngọt, ít đá...):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 50% đường, 70% đá..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #fed7aa',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            {/* SỐ LƯỢNG & NÚT THÊM */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 12,
                  border: '1px solid #fed7aa',
                  backgroundColor: '#fff7ed',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span style={{ padding: '8px 12px', fontSize: 14, fontWeight: 800 }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 14,
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
                }}
              >
                Thêm vào giỏ • {formatCurrencyVND(currentModalPrice)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
