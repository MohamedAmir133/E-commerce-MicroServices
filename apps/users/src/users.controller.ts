import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHello(): string {
    return this.usersService.getHello();
  }

  @MessagePattern('user.sync')
  async handleUserSync(@Payload() data: { clerkUserId: string; email: string; name: string }) {
    console.log(`[UsersController] Received user.sync RPC pattern with data:`, JSON.stringify(data));
    return this.usersService.upsertUser(data);
  }
}
