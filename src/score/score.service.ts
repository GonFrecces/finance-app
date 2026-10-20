import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { formatRut, normalizeRut } from '../common/rut.util';

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

@Injectable()
export class ScoreService {
  constructor(private readonly config: ConfigService) {}

  getScore(rut: string): ScoreResponse {
    return {
      rut: formatRut(rut),
      score: this.computeScore(rut),
      // ISO 8601 sin milisegundos, como en el ejemplo del challenge.
      fecha: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
  }

  /**
   * Score determinista en [0, 100]:
   * SHA-256(salt + RUT normalizado) -> primeros 4 bytes como entero -> % 101.
   * Mismo RUT => mismo score; RUTs distintos => scores bien distribuidos.
   * La sal (SCORE_SALT) evita que terceros reproduzcan el score solo con el algoritmo.
   */
  computeScore(rut: string): number {
    const salt = this.config.get<string>('SCORE_SALT') ?? '';
    const digest = createHash('sha256')
      .update(`${salt}:${normalizeRut(rut)}`)
      .digest();

    return digest.readUInt32BE(0) % 101;
  }
}
