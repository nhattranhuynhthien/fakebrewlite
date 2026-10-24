import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController (API-T01)', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('GET /products should return seeded menu list', () => {
    const result = controller.getProducts();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result[0]).toHaveProperty('id', 'prod-01');
  });

  it('GET /products/:id should return product detail when id exists', () => {
    const product = controller.getProductById('prod-01');
    expect(product.name).toBe('Trà Sữa Ô Long Nướng');
    expect(product.basePrice).toBe(35000);
  });

  it('GET /products/:id should throw NotFoundException when id does not exist', () => {
    expect(() => controller.getProductById('non-existent')).toThrow(NotFoundException);
  });
});