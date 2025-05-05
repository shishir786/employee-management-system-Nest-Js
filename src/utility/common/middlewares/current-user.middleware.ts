import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserEntity;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (
      !authHeader ||
      isArray(authHeader) ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      req.currentUser = undefined; // Set currentUser to undefined if no token is provided
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;

      if (!decoded.sub || isNaN(Number(decoded.sub))) {
        throw new Error('Invalid or missing `sub` in JWT payload');
      }

      const userId = Number(decoded.sub);
      const currentUser = await this.usersService.findOne(userId);
      req.currentUser = currentUser;

      next();
    } catch (error) {
      console.error('JWT verification failed :', error.message);
      req.currentUser = undefined;
      next();
    }
  }
}
