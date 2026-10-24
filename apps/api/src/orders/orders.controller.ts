import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import {
  OrderItemInput,
  OrdersService,
  OrderStatus,
} from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  @Post('checkout')
  checkout(
    @Headers('authorization') authHeader: string,
    @Headers('idempotency-key') headerIdempotencyKey: string,
    @Body()
    body: {
      items: OrderItemInput[];
      paymentMethod: 'WALLET' | 'CARD';
      idempotencyKey?: string;
      simulateFail?: boolean;
    },
  ) {
    const user = this.authService.verifyToken(authHeader);
    const key = headerIdempotencyKey || body.idempotencyKey || '';
    return this.ordersService.createOrderAndCheckout({
      userId: user.sub,
      items: body.items,
      paymentMethod: body.paymentMethod || 'WALLET',
      idempotencyKey: key,
      simulateFail: body.simulateFail,
    });
  }

  @Get()
  getMyOrders(@Headers('authorization') authHeader: string) {
    const user = this.authService.verifyToken(authHeader);
    return this.ordersService.getOrdersByUser(user.sub);
  }

  @Get(':id')
  getOrderDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.authService.verifyToken(authHeader);
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    this.authService.verifyToken(authHeader);
    return this.ordersService.updateOrderStatus(id, body.status);
  }
}