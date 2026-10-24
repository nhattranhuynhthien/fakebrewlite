import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ProductsController } from '../products/products.controller';
import { AuthController } from '../auth/auth.controller';
import { OrdersController } from './orders.controller';
import { HealthController } from '../health/health.controller';

describe('End-to-End Customer Journey (E2E-T01)', () => {
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

  it('E2E-T01: Full flow from viewing menu -> selecting options -> registering -> paying order -> viewing confirmation & health check', () => {
    // 1. Kiểm tra Health Check
    const health = healthController.checkHealth();
    expect(health.status).toBe('ok');

    // 2. Khách hàng xem Menu và xem chi tiết món
    const menu = productsController.getProducts();
    expect(menu.length).toBeGreaterThan(0);
    const chosenDrink = productsController.getProductById(menu[0].id);
    expect(chosenDrink.id).toBe('prod-01');

    // 3. Khách hàng đăng ký tài khoản mới và nhận JWT
    const authRes = authController.register({
      email: 'e2e_user@brewlite.vn',
      password: 'password123',
      fullName: 'E2E Customer',
    });
    expect(authRes.accessToken).toBeDefined();
    const bearer = `Bearer ${authRes.accessToken}`;

    // 4. Khách hàng đặt đơn và thanh toán qua Ví
    const checkoutRes = ordersController.checkout(bearer, 'e2e-idem-001', {
      items: [
        {
          productId: chosenDrink.id,
          quantity: 1,
          selectedSize: 'L',
          selectedToppings: ['top-01', 'top-02'],
        },
      ],
      paymentMethod: 'WALLET',
    });

    expect(checkoutRes.order.status).toBe('PAID');
    expect(checkoutRes.payment.status).toBe('SUCCESS');

    // 5. Khách hàng xem lịch sử đơn và nhân viên cập nhật trạng thái COMPLETED
    const myOrders = ordersController.getMyOrders(bearer);
    expect(myOrders.length).toBe(1);
    expect(myOrders[0].id).toBe(checkoutRes.order.id);

    const updated = ordersController.updateStatus(bearer, checkoutRes.order.id, {
      status: 'COMPLETED',
    });
    expect(updated.status).toBe('COMPLETED');
  });
});