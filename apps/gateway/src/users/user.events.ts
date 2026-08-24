// events will be public contracts between services
// small + stable

export type UserCreatedEvent = {
  clerkUserId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};
