// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(user: Omit<UserEntity, 'password'>): { accessToken: string } {
    const payload = { sub: user.id, email: user.email, role: user.role };  // Include role in the payload
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
