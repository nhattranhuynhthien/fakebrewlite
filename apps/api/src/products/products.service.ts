import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product, SEED_PRODUCTS } from './products.seed';

@Injectable()
export class ProductsService {
  private products: Product[] = SEED_PRODUCTS.map((p) => ({ ...p }));

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  calculateItemUnitPrice(
    productId: string,
    selectedSize: 'S' | 'M' | 'L',
    selectedToppingIds: string[],
  ): number {
    const product = this.findOne(productId);
    const sizeOption = product.availableSizes.find((s) => s.name === selectedSize);
    if (!sizeOption) {
      throw new BadRequestException(
        `Size "${selectedSize}" không hợp lệ cho món ${product.name}`,
      );
    }

    let toppingTotal = 0;
    for (const topId of selectedToppingIds || []) {
      const top = product.availableToppings.find((t) => t.id === topId);
      if (!top) {
        throw new BadRequestException(`Topping "${topId}" không hợp lệ`);
      }
      toppingTotal += top.price;
    }

    return product.basePrice + sizeOption.priceDelta + toppingTotal;
  }

  reserveStockTransaction(items: { productId: string; quantity: number }[]): void {
    // Bước 1: Kiểm tra toàn bộ tồn kho trước khi trừ (Atomic Check)
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
      }
      const product = this.findOne(item.productId);
      if (!product.isAvailable || product.stock < item.quantity) {
        throw new ConflictException(
          `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng tồn kho (còn ${product.stock})`,
        );
      }
    }

    // Bước 2: Trừ tồn kho khi tất cả đều hợp lệ (Commit)
    for (const item of items) {
      const product = this.findOne(item.productId);
      product.stock -= item.quantity;
    }
  }

  releaseStock(items: { productId: string; quantity: number }[]): void {
    for (const item of items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }
  }

  resetSeed(): void {
    this.products = SEED_PRODUCTS.map((p) => ({ ...p }));
  }
}