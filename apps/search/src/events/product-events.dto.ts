import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductCreatedDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsIn(['DRAFT', 'ACTIVE'])
  status: 'DRAFT' | 'ACTIVE';

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  createdByClerkUserId?: string;
}
