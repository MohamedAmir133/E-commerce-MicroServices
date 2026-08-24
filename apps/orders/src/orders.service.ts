import { Injectable } from '@nestjs/common';
import { createOrderDto } from './dtos/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { rpcNotFound } from '@app/rpc';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async createOrder(payload: createOrderDto): Promise<OrderEntity> {
    const order = await this.orderRepo.save(payload);
    return order;
  }
  async listOrder(): Promise<OrderEntity[]> {
    const order = await this.orderRepo.find();
    return {
      orders: order,
      status: 'success',
    };
  }
  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) {
      rpcNotFound('Order is not present in DB');
    }

    return order;
  }
}
