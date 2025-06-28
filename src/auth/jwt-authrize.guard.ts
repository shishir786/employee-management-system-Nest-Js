// authrize.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthrizeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.get<string[]>(
      'allowedRoles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const currentUser = request.currentUser; // Changed from user to currentUser

    // console.log('Current user:', currentUser);  // Log to debug

    if (!currentUser || !currentUser.role) {
      throw new UnauthorizedException('User or role not found');
    }

    // If no roles are specified, allow any authenticated user
    if (!allowedRoles) {
      return true;
    }

    // Check if the user has any of the required roles
    const hasAccess = currentUser.role.some((role) =>
      allowedRoles.includes(role),
    );

    if (hasAccess) return true;

    throw new UnauthorizedException(
      'You are not authorized to access this resource',
    );
  }
}
