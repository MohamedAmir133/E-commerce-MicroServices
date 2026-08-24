import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface UserFromPostgres {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject('USERS_CLIENT') private readonly usersClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.usersClient.connect();
    } catch (e) {
      console.warn('USERS_CLIENT failed to connect on module init', e);
    }
  }

  async upsertAuthUser(input: {
    clerkUserId: string;
    email: string;
    name: string;
  }): Promise<UserFromPostgres> {
    console.log(`[upsertAuthUser] Syncing user with Postgres via RMQ RPC: ${input.clerkUserId}`);
    
    try {
      const user = await firstValueFrom(
        this.usersClient.send<UserFromPostgres>('user.sync', {
          clerkUserId: input.clerkUserId,
          email: input.email,
          name: input.name,
        }),
      );
      console.log(`[upsertAuthUser] User synced successfully in Postgres:`, user);
      return user;
    } catch (err) {
      console.error('[upsertAuthUser] Failed to sync user via RMQ RPC:', err);
      // Fallback object if RMQ request fails
      return {
        id: '',
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name,
        role: 'user',
      };
    }
  }
}

