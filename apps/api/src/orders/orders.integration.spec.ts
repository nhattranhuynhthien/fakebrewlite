import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AuthController } from '../auth/auth.controller';
import { OrdersController } from './orders.controller';
import { ProductsService } from '../products/products.service';

describe('Orders & Payments Integration Tests (INT-T01 -> INT-T03)', () => {
  let authController: AuthController;
  let ordersController: OrdersController;
  let productsService: ProductsService;
  let bearerToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authController = moduleFixture.get<AuthController>(AuthController);
    ordersController = moduleFixture.get<OrdersController>(OrdersController);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
    productsService.resetSeed();

    const loginRes = authController.login({
      email: 'customer@brewlite.vn',
      password: '123456',
    });
    bearerToken = `Bearer ${loginRes.accessToken}`;
  });

  it('INT-T01: should reject checkout with 401 Unauthorized when JWT is missing or invalid', () => {
    expect(() =>
      ordersController.checkout('', 'idem-key-001', {
        items: [
          {
            productId: 'prod-01',
            quantity: 1,
            selectedSize: 'M',
            selectedToppings: ['top-01'],
          },
        ],
        paymentMethod: 'WALLET',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('UNIT-T01 & INT-T02: should calculate size/topping price accurately, deduct stock on success, and rollback on out-of-stock', () => {
    // prod-01 base = 35000, size M = +6000, top-01 = +8000 => 49000 * 2 = 98000
    const initialStock = productsService.findOne('prod-01').stock;

    const result = ordersController.checkout(bearerToken, 'idem-key-002', {
      items: [
        {
          productId: 'prod-01',
          quantity: 2,
          selectedSize: 'M',
          selectedToppings: ['top-01'],
        },
      ],
      paymentMethod: 'WALLET',
    });

    expect(result.order.status).toBe('PAID');
    expect(result.order.totalAmount).toBe(98000);
    expect(productsService.findOne('prod-01').stock).toBe(initialStock - 2);

    // Đặt vượt quá tồn kho (stock còn lại < 999) -> Phải báo lỗi Conflict và không trừ kho
    expect(() =>
      ordersController.checkout(bearerToken, 'idem-key-out-of-stock', {
        items: [
          {
            productId: 'prod-01',
            quantity: 999,
            selectedSize: 'S',
            selectedToppings: [],
          },
        ],
        paymentMethod: 'WALLET',
      }),
    ).toThrow(ConflictException);

    expect(productsService.findOne('prod-01').stock).toBe(initialStock - 2);
  });

  it('INT-T03: should guarantee Idempotency (no duplicate charge or double stock deduction on retry)', () => {
    const initialStock = productsService.findOne('prod-02').stock;

    const firstCall = ordersController.checkout(bearerToken, 'idem-key-duplicate', {
      items: [
        {
          productId: 'prod-02',
          quantity: 1,
          selectedSize: 'S',
          selectedToppings: [],
        },
      ],
      paymentMethod: 'CARD',
    });

    const secondCall = ordersController.checkout(bearerToken, 'idem-key-duplicate', {
      items: [
        {
          productId: 'prod-02',
          quantity: 1,
          selectedSize: 'S',
          selectedToppings: [],
        },
      ],
      paymentMethod: 'CARD',
    });

    expect(firstCall.idempotentReplay).toBe(false);
    expect(secondCall.idempotentReplay).toBe(true);
    expect(secondCall.order.id).toBe(firstCall.order.id);
    expect(secondCall.payment.id).toBe(firstCall.payment.id);
    // Tồn kho chỉ bị trừ đúng 1 lần duy nhất
    expect(productsService.findOne('prod-02').stock).toBe(initialStock - 1);
  });

  it('INT-T04: should restore stock and set status to PAYMENT_FAILED when simulated payment fails', () => {
    const initialStock = productsService.findOne('prod-03').stock;

    const failedRes = ordersController.checkout(bearerToken, 'idem-key-fail', {
      items: [
        {
          productId: 'prod-03',
          quantity: 3,
          selectedSize: 'M',
          selectedToppings: [],
        },
      ],
      paymentMethod: 'CARD',
      simulateFail: true,
    });

    expect(failedRes.order.status).toBe('PAYMENT_FAILED');
    expect(failedRes.payment.status).toBe('FAILED');
    // Tồn kho được hoàn trả nguyên vẹn
    expect(productsService.findOne('prod-03').stock).toBe(initialStock);
  });
});