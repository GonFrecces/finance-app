import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';

@Module({
  // AuthModule exporta JwtModule y los guards que usa el controller.
  imports: [AuthModule],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
