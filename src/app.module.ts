import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScoreModule } from './score/score.module';

@Module({
  imports: [
    // Carga .env y deja ConfigService disponible en todos los módulos.
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ScoreModule,
  ],
})
export class AppModule {}
