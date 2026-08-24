import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../auth/current-user-decorator';
import type { UserContext } from '../auth/auth.types';
import { mapRpcErrorToHttp } from '@app/rpc';
import { firstValueFrom } from 'rxjs';
import { AdminOnly } from '../auth/admin.decorator';
import { Public } from '../auth/public.decorater';
import { BadRequestException } from '@nestjs/common';

type Order = {
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
};

@Controller()
export class OrdersHttpController {
  constructor(
    // gateway talks to catalog via RMQ client
    @Inject('ORDERS_Client') private readonly ordersClient: ClientProxy,
  ) {}

  //   media and image logic later placeholder
  @Post('orders')
  // @AdminOnly()
  async createOrder(
    @CurrentUser() user: UserContext,
    @Body()
    body: {
      productId: string;
      quantity: number;
    },
  ) {
    // do the basic validation -> just for practice

    let order: Order | undefined;

    const payload = {
      userId: user.clerkUserId,
      productId: body.productId,
      quantity: body.quantity,
      totalPrice: body.quantity * 100,
    };

    try {
      order = await firstValueFrom(
        this.ordersClient.send('order.create', payload),
      );
    } catch (error) {
      mapRpcErrorToHttp(error);
    }
    if (!order) {
      throw new BadRequestException('Order not created');
    }
    return order;
  }

  @Get('orders')
  @Public()
  async listOrders() {
    try {
      return await firstValueFrom(this.ordersClient.send('order.list', {}));
    } catch (err) {
      mapRpcErrorToHttp(err);
    }
  }

  @Get('orders/:id')
  @Public()
  async getOrder(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.ordersClient.send('order.getById', { id }),
      );
    } catch (err) {
      mapRpcErrorToHttp(err);
    }
  }
}
