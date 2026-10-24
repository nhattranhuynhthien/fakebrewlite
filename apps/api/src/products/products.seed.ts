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
  availableSizes: SizeOption[];
  availableToppings: ToppingOption[];
  stock: number;
  isAvailable: boolean;
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Trà Sữa Ô Long Nướng',
    description: 'Trà ô long rang đậm vị kết hợp sữa tươi thanh mát.',
    basePrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
    category: 'Trà Sữa',
    availableSizes: [
      { name: 'S', priceDelta: 0 },
      { name: 'M', priceDelta: 6000 },
      { name: 'L', priceDelta: 12000 },
    ],
    availableToppings: [
      { id: 'top-01', name: 'Trân châu đen', price: 8000 },
      { id: 'top-02', name: 'Kem phô mai Macchiato', price: 12000 },
    ],
    stock: 25,
    isAvailable: true,
  },
  {
    id: 'prod-02',
    name: 'Cà Phê Muối Huế',
    description: 'Cà phê phin truyền thống hòa quyện lớp kem muối béo mặn.',
    basePrice: 29000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    category: 'Cà Phê',
    availableSizes: [
      { name: 'S', priceDelta: 0 },
      { name: 'M', priceDelta: 5000 },
    ],
    availableToppings: [
      { id: 'top-03', name: 'Thêm Kem Muối', price: 10000 },
      { id: 'top-04', name: 'Thạch Cà Phê', price: 7000 },
    ],
    stock: 40,
    isAvailable: true,
  },
  {
    id: 'prod-03',
    name: 'Trà Đào Cam Sả',
    description: 'Trà đen ủ lạnh cùng đào miếng giòn, cam vàng và hương sả tươi.',
    basePrice: 39000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    category: 'Trà Trái Cây',
    availableSizes: [
      { name: 'M', priceDelta: 0 },
      { name: 'L', priceDelta: 10000 },
    ],
    availableToppings: [
      { id: 'top-05', name: 'Thêm Đào Miếng (3 miếng)', price: 12000 },
      { id: 'top-06', name: 'Trân châu trắng', price: 8000 },
    ],
    stock: 15,
    isAvailable: true,
  }
];