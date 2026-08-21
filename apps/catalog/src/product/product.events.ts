// events will be public contracts between services
// small + stable

export type ProductCreatedEvent = {
  productId: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE';
  price: number;
  imageUrl?: string;
  createdByClerkUserId: string;
};
