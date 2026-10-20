import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidRut, normalizeRut } from '../rut.util';

/**
 * Valida el RUT recibido como parámetro y lo entrega normalizado al handler.
 * Responde 400 si el formato o el dígito verificador son inválidos.
 */
@Injectable()
export class RutValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string' || !isValidRut(value)) {
      throw new BadRequestException('Invalid RUT');
    }

    return normalizeRut(value);
  }
}
