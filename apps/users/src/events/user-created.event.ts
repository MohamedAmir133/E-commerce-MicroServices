import { IsIn, IsString } from 'class-validator';

export class UserCreatedEvent {
  @IsString()
  clerkUserId!: string;

  @IsString()
  email!: string;

  @IsString()
  name!: string;

  @IsIn(['user', 'admin'])
  role!: 'user' | 'admin';
}

