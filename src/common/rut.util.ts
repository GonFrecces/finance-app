/**
 * Utilidades para RUT chileno.
 * Formato normalizado: cuerpo + DV, sin puntos ni guion y con la K en mayúscula.
 * Ej: '12.345.678-5' -> '123456785'
 */
export function normalizeRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

// Dígito verificador por algoritmo módulo 11.
export function computeDv(body: string): string {
  let sum = 0;
  let multiplier = 2;

  for (const digit of body.split('').reverse()) {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const result = 11 - (sum % 11);
  if (result === 11) return '0';
  if (result === 10) return 'K';
  return String(result);
}

export function isValidRut(rut: string): boolean {
  const normalized = normalizeRut(rut);

  if (!/^\d{7,8}[\dK]$/.test(normalized)) {
    return false;
  }

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  return computeDv(body) === dv;
}

// '123456785' -> '12.345.678-5'
export function formatRut(rut: string): string {
  const normalized = normalizeRut(rut);
  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}
