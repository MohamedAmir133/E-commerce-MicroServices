import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductDto, GetProductByIdDto } from './product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @MessagePattern('product.create')
  create(@Payload() payload: CreateProductDto) {
    return this.productsService.createNewProduct(payload);
  }

  @MessagePattern('product.list')
  list() {
    return this.productsService.listProducts();
  }

  @MessagePattern('product.getById')
  getbyId(@Payload() payload: GetProductByIdDto) {
    return this.productsService.getProductById(payload);
  }
}
