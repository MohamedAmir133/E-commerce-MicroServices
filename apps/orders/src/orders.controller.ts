import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { createOrderDto } from './dtos/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('order.create')
  async createOrder(@Payload() data: createOrderDto) {
    return this.ordersService.createOrder(data);
  }
  @MessagePattern('order.list')
  async listOrder() {
    return this.ordersService.listOrder();
  }
  @MessagePattern('order.getById')
  async getOrderById(@Payload() data: { id: string }) {
    return this.ordersService.getOrderById(data.id);
  }
}
