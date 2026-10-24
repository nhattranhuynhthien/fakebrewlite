import {
  resolveMenuViewState,
  formatCurrencyVND,
  calculateUnitPrice,
  calculateCartTotal,
  Product,
  CartItem,
} from './MenuView';

const mockProduct: Product = {
  id: 'prod-01',
  name: 'Trà Sữa Ô Long Nướng',
  description: 'Trà ô long đậm vị',
  basePrice: 35000,
  imageUrl: 'https://example.com/tea.jpg',
  category: 'Trà Sữa',
  availableSizes: [
    { name: 'S', priceDelta: 0 },
    { name: 'M', priceDelta: 6000 },
  ],
  availableToppings: [{ id: 'top-01', name: 'Trân châu đen', price: 8000 }],
  stock: 10,
  isAvailable: true,
};

describe('MenuView & Checkout Cart Flow (WEB-T01 & E2E-T01)', () => {
  it('should return "loading" state when isLoading is true', () => {
    expect(resolveMenuViewState(true, null, [])).toBe('loading');
  });

  it('should return "error" state when error message is present', () => {
    expect(resolveMenuViewState(false, 'Network Error', [])).toBe('error');
  });

  it('should return "empty" state when product list is empty', () => {
    expect(resolveMenuViewState(false, null, [])).toBe('empty');
  });

  it('should return "ready" state when products are loaded', () => {
    expect(resolveMenuViewState(false, null, [mockProduct])).toBe('ready');
  });

  it('should format VND price properly', () => {
    expect(formatCurrencyVND(35000)).toContain('35');
    expect(formatCurrencyVND(35000)).toContain('đ');
  });

  it('E2E-T01: should calculate item unit price with size and toppings accurately and compute cart total', () => {
    const unitPrice = calculateUnitPrice(mockProduct, 'M', [
      { id: 'top-01', name: 'Trân châu đen', price: 8000 },
    ]);
    // 35000 + 6000 (Size M) + 8000 (Topping) = 49000
    expect(unitPrice).toBe(49000);

    const cart: CartItem[] = [
      {
        cartItemId: 'prod-01-M-top-01',
        product: mockProduct,
        quantity: 2,
        selectedSize: 'M',
        selectedToppings: [{ id: 'top-01', name: 'Trân châu đen', price: 8000 }],
        unitPrice,
      },
    ];

    expect(calculateCartTotal(cart)).toBe(98000);
  });
});