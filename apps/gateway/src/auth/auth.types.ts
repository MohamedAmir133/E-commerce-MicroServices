export type UserContext = {
  clerkUserId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
};
