import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { HealthController } from './health/health.controller';
import { AppController } from './app.controller';

@Module({
  imports: [ProductsModule],
  controllers: [AppController, AuthController, OrdersController, HealthController],
  providers: [AuthService, OrdersService],
})
export class AppModule {}
