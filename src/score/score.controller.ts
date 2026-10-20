import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RutOwnershipGuard } from '../auth/guards/rut-ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RutValidationPipe } from '../common/pipes/rut-validation.pipe';
import { ScoreService } from './score.service';

@Controller('score')
// Orden importa: autenticación -> rol -> propiedad del RUT.
@UseGuards(JwtAuthGuard, RolesGuard, RutOwnershipGuard)
@Roles('admin', 'user')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get(':rut')
  getScore(@Param('rut', RutValidationPipe) rut: string) {
    return this.scoreService.getScore(rut);
  }
}
