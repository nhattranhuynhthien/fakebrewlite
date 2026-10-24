import {
  resolveMenuViewState,
  formatCurrencyVND,
  Product,
} from './MenuView';

const mockProduct: Product = {
  id: 'prod-01',
  name: 'Trà Sữa Ô Long Nướng',
  description: 'Trà ô long đậm vị',
  basePrice: 35000,
  imageUrl: 'https://example.com/tea.jpg',
  category: 'Trà Sữa',
  stock: 10,
  isAvailable: true,
};

describe('MenuView State & Helpers (WEB-T01)', () => {
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
});