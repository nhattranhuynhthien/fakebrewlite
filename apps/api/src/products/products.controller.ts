import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.seed';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts(): Product[] {
    return this.productsService.findAll();
  }

  @Get(':id')
  getProductById(@Param('id') id: string): Product {
    return this.productsService.findOne(id);
  }
}