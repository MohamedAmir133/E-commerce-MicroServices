import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async upsertUser(input: {
    clerkUserId: string;
    email: string;
    name: string;
    role?: 'user' | 'admin';
  }): Promise<UserEntity> {
    this.logger.log(`Upserting user in Postgres: ${JSON.stringify(input)}`);

    let user = await this.userRepository.findOne({
      where: { clerkUserId: input.clerkUserId },
    });

    if (!user) {
      user = this.userRepository.create({
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name,
        role: input.role ?? 'user',
      });
      await this.userRepository.save(user);
      this.logger.log(
        `Successfully saved user ${user.clerkUserId} to Postgres`,
      );
    } else {
      user.email = input.email;
      user.name = input.name;
      if (input.role) user.role = input.role;
      await this.userRepository.save(user);
      this.logger.log(`Updated user ${user.clerkUserId} in Postgres`);
    }

    return user;
  }
}
