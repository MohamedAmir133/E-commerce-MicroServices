import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductStatus } from './product.schema';
import { isValidObjectId, Model } from 'mongoose';
import { rpcBadRequest, rpcNotFound } from '@app/rpc';
import { ProductEventsPublisher } from '../events/product-events.publisher';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    private readonly events: ProductEventsPublisher,
  ) {}

  async createNewProduct(input: {
    name: string;
    description: string;
    price: number;
    status?: ProductStatus;
    imageUrl?: string;
    createdByClerkUserId: string;
  }) {
    if (!input.name || !input.description) {
      rpcBadRequest('name and description are required');
    }

    if (
      typeof input.price !== 'number' ||
      Number.isNaN(input.price) ||
      input.price < 0
    ) {
      rpcBadRequest('Price must be a valid number >=0');
    }

    if (input.status && input.status !== 'DRAFT' && input.status !== 'ACTIVE') {
      rpcBadRequest('Status must be either draft or active');
    }

    const newlyCreatedProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      price: input.price,
      status: (input.status ?? 'DRAFT') as ProductStatus,
      imageUrl: input.imageUrl ?? '',
      createdByClerkUserId: input.createdByClerkUserId,
    });

    //emit that event after db success

    await this.events.productCreated({
      productId: String(newlyCreatedProduct._id),
      name: newlyCreatedProduct.name,
      description: newlyCreatedProduct.description,
      status: newlyCreatedProduct.status,
      price: newlyCreatedProduct.price,
      imageUrl: newlyCreatedProduct.imageUrl,
      createdByClerkUserId: newlyCreatedProduct.createdByClerkUserId,
    });

    return newlyCreatedProduct;
  }

  async listProducts() {
    Logger.log('list products');
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProductById(input: { id: string }) {
    if (!isValidObjectId(input.id)) {
      rpcBadRequest('Invaid product ID');
    }

    const product = await this.productModel.findById(input.id).exec();

    if (!product) {
      rpcNotFound('Product is not present in DB');
    }

    return product;
  }
}
