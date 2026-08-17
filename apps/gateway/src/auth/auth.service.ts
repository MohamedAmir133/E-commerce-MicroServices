import { createClerkClient, verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserContext } from './auth.types';

type ClerkTokenPayload = {
  sub?: string;
  userId?: string;
  email?: string;
  email_address?: string;
  primaryEmailAddress?: string;
  name?: string;
  fullName?: string;
  username?: string;
};

type ClerkUserRecord = {
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  primaryEmailAddressId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};

function hasClerkPayload(
  value: unknown,
): value is { payload?: ClerkTokenPayload } {
  return typeof value === 'object' && value !== null && 'payload' in value;
}

@Injectable()
export class AuthService {
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey:
      process.env.CLERK_PUBLISHABLE_KEY ?? process.env.PUBLIC_PUBLISHABLE_KEY,
  });

  private jwtVerifyOptions(): Record<string, any> {
    return {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 1000 * 60 * 10, // 10 minutes leeway for clock skew
    };
  }

  async verifyAndBuildContext(token: string): Promise<UserContext> {
    try {
      const verified: unknown = await verifyToken(
        token,
        this.jwtVerifyOptions(),
      );

      // decoded payload
      const payload: ClerkTokenPayload = hasClerkPayload(verified)
        ? (verified.payload ?? {})
        : (verified as ClerkTokenPayload);

      // clerk user id -> payload.sub
      const clerkUserId = payload?.sub ?? payload?.userId;

      if (!clerkUserId) {
        throw new UnauthorizedException('Token is missing user id ');
      }

      const role: 'user' | 'admin' = 'user';

      const emailFromToken =
        payload?.email ??
        payload?.email_address ??
        payload?.primaryEmailAddress ??
        '';

      const nameFromToken =
        payload?.name ?? payload?.fullName ?? payload?.username ?? '';

      if (emailFromToken && nameFromToken) {
        return {
          clerkUserId,
          email: emailFromToken,
          name: nameFromToken,
          role,
          isAdmin: false,
        };
      }

      const user = (await this.clerk.users.getUser(
        clerkUserId,
      )) as unknown as ClerkUserRecord;

      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        '';

      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        primaryEmail ||
        clerkUserId;

      return {
        clerkUserId,
        email: emailFromToken || primaryEmail,
        name: nameFromToken || fullName,
        role,
        isAdmin: false,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
