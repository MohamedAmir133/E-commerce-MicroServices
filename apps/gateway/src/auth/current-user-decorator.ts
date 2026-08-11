import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserContext } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserContext }>();
    return request.user;
  },
);
