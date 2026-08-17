import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export type ProductStatus = 'DRAFT' | 'ACTIVE';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: ['DRAFT', 'ACTIVE'], default: 'DRAFT' })
  status: ProductStatus;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true })
  createdByClerkUserId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
