import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { normalizeRut } from '../../common/rut.util';

/**
 * Autorización por recurso (no por rol):
 * - admin: puede consultar cualquier RUT.
 * - user: solo el RUT que viene en su token.
 * Debe ejecutarse después de JwtAuthGuard, que deja request.user.
 */
@Injectable()
export class RutOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const requestedRut = request.params.rut;

    if (user?.role === 'admin') {
      return true;
    }

    if (
      user?.role === 'user' &&
      typeof user.rut === 'string' &&
      typeof requestedRut === 'string' &&
      normalizeRut(requestedRut) === normalizeRut(user.rut)
    ) {
      return true;
    }

    throw new ForbiddenException('You can only query your own RUT');
  }
}
