import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class createOrderDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
