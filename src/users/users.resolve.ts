import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  // Admin y user pueden acceder.
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  // Solo admin puede acceder.
  @Get()
  @Roles('admin')
  findAll() {
    return { message: 'Lista de usuarios' };
  }
}
