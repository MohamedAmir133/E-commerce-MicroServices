import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SearchProduct, SearchProductDocument } from './search/search-schema';
import { Model } from 'mongoose';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(SearchProduct.name)
    private readonly model: Model<SearchProductDocument>,
  ) {}

  normalizeText(input: { name: string; description: string }) {
    return `${input.name} ${input.description}`.toLowerCase();
  }

  async upsertFromCatalogEvent(input: {
    productId: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE';
    price: number;
  }) {
    const normalizedText = this.normalizeText({
      name: input.name,
      description: input.description,
    });

    console.log(input, 'input here');

    try {
      const result = await this.model.findOneAndUpdate(
        { productId: input.productId },
        {
          $set: {
            name: input.name,
            description: input.description,
            normalizedText,
            status: input.status,
            price: input.price,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      );

      console.log('Upsert result:', result);
    } catch (err) {
      console.error('Failed to upsert search document', err);
      throw err;
    }

    console.log('Search doc added as soon as product is created');
  }

  async query(input: { q: string; limit?: number }) {
    const q = (input.q ?? '').trim().toLowerCase();

    if (!q) {
      return [];
    }

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return this.model
      .find({ normalizedText: { $regex: regex } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  ping() {
    return {
      ok: true,
      service: 'search',
      now: new Date().toISOString(),
    };
  }
}
