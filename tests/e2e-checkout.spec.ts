/**
 * End-to-End Test Suite: BrewLite Customer Journey (Task 5.2 & S2-27)
 * Flow: Xem menu -> Tùy chọn Size/Topping -> Giỏ hàng -> Đăng ký/JWT -> Đặt đơn (Transaction) -> Thanh toán (Idempotency) -> Xác nhận & Lịch sử
 */

import { Test, TestingModule } from '../apps/api/node_modules/@nestjs/testing';
import { AppModule } from '../apps/api/src/app.module';
import { ProductsController } from '../apps/api/src/products/products.controller';
import { AuthController } from '../apps/api/src/auth/auth.controller';
import { OrdersController } from '../apps/api/src/orders/orders.controller';
import { HealthController } from '../apps/api/src/health/health.controller';

describe('BrewLite E2E Flow (tests/e2e-checkout.spec.ts)', () => {
  let productsController: ProductsController;
  let authController: AuthController;
  let ordersController: OrdersController;
  let healthController: HealthController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    productsController = moduleFixture.get<ProductsController>(ProductsController);
    authController = moduleFixture.get<AuthController>(AuthController);
    ordersController = moduleFixture.get<OrdersController>(OrdersController);
    healthController = moduleFixture.get<HealthController>(HealthController);
  });

  it('Step 1: Health check endpoint returns status ok (NFR-03)', () => {
    const health = healthController.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.environment).toBeDefined();
  });

  it('Step 2: Customer views menu and selects drink with options (FR-01, FR-02)', () => {
    const products = productsController.getProducts();
    expect(products.length).toBeGreaterThanOrEqual(1);

    const drink = productsController.getProductById(products[0].id);
    expect(drink.id).toBe('prod-01');
    expect(drink.availableSizes).toBeDefined();
    expect(drink.availableToppings).toBeDefined();
    expect(drink.stock).toBeGreaterThan(0);
  });

  it('Step 3: Customer registers account and acquires JWT Bearer token (FR-04, NFR-02)', () => {
    const authRes = authController.register({
      email: 'e2e_customer_flow@brewlite.vn',
      password: 'StrongPassword123',
      fullName: 'BrewLite E2E Tester',
    });
    expect(authRes.accessToken).toBeDefined();
    expect(authRes.user.email).toBe('e2e_customer_flow@brewlite.vn');
  });

  it('Step 4: Customer places order and completes mock payment with Idempotency (FR-05, FR-06)', () => {
    const authRes = authController.login({
      email: 'e2e_customer_flow@brewlite.vn',
      password: 'StrongPassword123',
    });
    const bearer = `Bearer ${authRes.accessToken}`;
    const idempotencyKey = `e2e-idem-${Date.now()}`;

    const checkoutRes = ordersController.checkout(bearer, idempotencyKey, {
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

    expect(checkoutRes.order).toBeDefined();
    expect(checkoutRes.order.status).toBe('PAID');
    expect(checkoutRes.payment.status).toBe('SUCCESS');
    expect(checkoutRes.payment.idempotencyKey).toBe(idempotencyKey);
  });

  it('Step 5: Customer views order in history and Barista updates status to COMPLETED (FR-07, FR-08, FR-09)', () => {
    const authRes = authController.login({
      email: 'e2e_customer_flow@brewlite.vn',
      password: 'StrongPassword123',
    });
    const bearer = `Bearer ${authRes.accessToken}`;

    const myOrders = ordersController.getMyOrders(bearer);
    expect(myOrders.length).toBeGreaterThanOrEqual(1);
    const latestOrderId = myOrders[0].id;

    const completed = ordersController.updateStatus(bearer, latestOrderId, {
      status: 'COMPLETED',
    });
    expect(completed.status).toBe('COMPLETED');
  });
});
