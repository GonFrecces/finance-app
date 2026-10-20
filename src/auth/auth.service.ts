import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './guards/jwt-auth.guard';
import { normalizeRut } from '../common/rut.util';

// Hash usado cuando el usuario no existe, para que la respuesta tarde lo mismo
// y no se pueda enumerar usuarios por tiempo de respuesta.
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = this.usersService.findByUsername(username);
    const passwordOk = this.verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !passwordOk) {
      // Mensaje genérico: no revela si falló el usuario o la password.
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      role: user.role,
    };

    // El claim rut solo va en tokens de rol 'user'.
    if (user.role === 'user' && user.rut) {
      payload.rut = normalizeRut(user.rut);
    }

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const expected = Buffer.from(hash, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  }
}
