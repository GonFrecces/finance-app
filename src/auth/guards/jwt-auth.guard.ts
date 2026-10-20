import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
  rut?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: JwtPayload;

    // verifyAsync valida firma y expiración (exp).
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Validación de claims fuera del try para no perder el mensaje.
    if (
      typeof payload.sub !== 'string' ||
      !['admin', 'user'].includes(payload.role) ||
      typeof payload.exp !== 'number' ||
      (payload.role === 'user' && typeof payload.rut !== 'string')
    ) {
      throw new UnauthorizedException('Invalid JWT claims');
    }

    request.user = payload;
    return true;
  }
}
