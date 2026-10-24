import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  selectedSize: 'S' | 'M' | 'L';
  selectedToppings: string[];
}

export interface OrderItemRecord extends OrderItemInput {
  productName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemRecord[];
  totalAmount: number;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  method: 'WALLET' | 'CARD';
  status: 'SUCCESS' | 'FAILED';
  externalTxId: string;
  createdAt: string;
}

@Injectable()
export class OrdersService {
  private orders: OrderRecord[] = [];
  private paymentsByIdempotencyKey = new Map<
    string,
    { order: OrderRecord; payment: PaymentRecord }
  >();

  constructor(private readonly productsService: ProductsService) {}

  createOrderAndCheckout(params: {
    userId: string;
    items: OrderItemInput[];
    paymentMethod: 'WALLET' | 'CARD';
    idempotencyKey: string;
    simulateFail?: boolean;
  }): { order: OrderRecord; payment: PaymentRecord; idempotentReplay: boolean } {
    const { userId, items, paymentMethod, idempotencyKey, simulateFail } = params;

    if (!idempotencyKey || idempotencyKey.trim() === '') {
      throw new BadRequestException('Thiếu header hoặc trường Idempotency-Key');
    }

    // 1. Kiểm tra Idempotency-Key chống thanh toán trùng lặp
    const existing = this.paymentsByIdempotencyKey.get(idempotencyKey);
    if (existing) {
      return {
        order: existing.order,
        payment: existing.payment,
        idempotentReplay: true,
      };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Giỏ hàng không được để trống');
    }

    // 2. Tính tiền từng món & kiểm tra hợp lệ
    const detailedItems: OrderItemRecord[] = items.map((item) => {
      const product = this.productsService.findOne(item.productId);
      const unitPrice = this.productsService.calculateItemUnitPrice(
        item.productId,
        item.selectedSize,
        item.selectedToppings || [],
      );
      return {
        ...item,
        productName: product.name,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const totalAmount = detailedItems.reduce((sum, i) => sum + i.totalPrice, 0);

    // 3. Mở Transaction kiểm tra và trừ tồn kho
    this.productsService.reserveStockTransaction(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    );

    const order: OrderRecord = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      status: 'PENDING',
      items: detailedItems,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    // 4. Gọi dịch vụ thanh toán mô phỏng (Nhánh alt: Thành công / Thất bại)
    const isPaymentFailed =
      simulateFail === true || process.env.PAYMENT_SIMULATION_MODE === 'FAIL';

    if (isPaymentFailed) {
      // Hoàn lại tồn kho khi thanh toán thất bại
      this.productsService.releaseStock(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      );
      order.status = 'PAYMENT_FAILED';
      this.orders.unshift(order);

      const failedPayment: PaymentRecord = {
        id: `PAY-${Date.now()}`,
        orderId: order.id,
        idempotencyKey,
        amount: totalAmount,
        method: paymentMethod,
        status: 'FAILED',
        externalTxId: `SIM-ERR-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      this.paymentsByIdempotencyKey.set(idempotencyKey, {
        order,
        payment: failedPayment,
      });

      return { order, payment: failedPayment, idempotentReplay: false };
    }

    // Thanh toán thành công
    order.status = 'PAID';
    this.orders.unshift(order);

    const successPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      orderId: order.id,
      idempotencyKey,
      amount: totalAmount,
      method: paymentMethod,
      status: 'SUCCESS',
      externalTxId: `SIM-OK-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.paymentsByIdempotencyKey.set(idempotencyKey, {
      order,
      payment: successPayment,
    });

    return { order, payment: successPayment, idempotentReplay: false };
  }

  getOrdersByUser(userId: string): OrderRecord[] {
    return this.orders.filter((o) => o.userId === userId);
  }

  getOrderById(orderId: string): OrderRecord {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${orderId}`);
    }
    return order;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): OrderRecord {
    const order = this.getOrderById(orderId);
    order.status = status;
    return order;
  }
}