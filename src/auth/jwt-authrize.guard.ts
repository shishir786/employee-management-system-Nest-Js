// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthrizeGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}
//   canActivate(context: ExecutionContext): boolean {
//     const allowedRoles = this.reflector.get<string[]>(
//       'allowedRoles',
//       context.getHandler(),
//     );

//     const request = context.switchToHttp().getRequest();
//     const result = request?.currentUser?.roles.some((role: string) =>
//       allowedRoles.includes(role),
//     );

//     if (result) return true;

//     throw new UnauthorizedException(
//       'You are not authorized to access this resource',
//     );
//   }
// }

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
    const currentUser = request.currentUser;

    if (!currentUser || !Array.isArray(currentUser.roles)) {
      throw new UnauthorizedException('User or roles not found');
    }

    const hasAccess = currentUser.roles.some((role: string) =>
      allowedRoles?.includes(role),
    );

    if (hasAccess) return true;

    throw new UnauthorizedException(
      'You are not authorized to access this resource',
    );
  }
}
