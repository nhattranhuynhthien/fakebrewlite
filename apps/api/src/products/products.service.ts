import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, SEED_PRODUCTS } from './products.seed';

@Injectable()
export class ProductsService {
  private products: Product[] = [...SEED_PRODUCTS];

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
}