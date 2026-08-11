import { Controller, Get, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user-decorator';
import type { UserContext } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@CurrentUser() user: UserContext) {
    return { user };
  }
}
