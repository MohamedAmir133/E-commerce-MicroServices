import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true, unique: true, index: true })
  publicId: string;

  @Prop({ required: true, index: true })
  uploadByUserId: string;

  @Prop({ required: false, index: true })
  productId?: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
