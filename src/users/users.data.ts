import type { Role } from '../auth/decorators/roles.decorator';

export interface MockUser {
  id: string;
  username: string;
  // Formato 'salt:hash' generado con scrypt (node:crypto). Nunca texto plano.
  passwordHash: string;
  role: Role;
  rut?: string;
}

/**
 * Usuarios mock (el challenge no requiere persistencia).
 * Credenciales de prueba:
 *   admin / Admin123!
 *   juan  / User123!  (RUT 12.345.678-5)
 *   maria / User456!  (RUT 11.111.111-1)
 */
export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash:
      '687b18a96997aac4352474e5163327d6:fdcf60909ee90f276bdd22587509618c1dcd34b4e12c54937adb3da38b84ac4564dd05eec1d5fb6801ab0712d2b539aa52eaa6cc99590ecac3f2856cf9ce3b65',
    role: 'admin',
  },
  {
    id: '2',
    username: 'juan',
    passwordHash:
      '22add9dcdcc1291040883e1d22d5b46f:4da932e8552b5eda02425713e5abb709056092b8730d379bbfd8ed24012acb92dd8118c573f262f34ee83e0b419b5bdd515e7325aa1d1745dd0997e48588f107',
    role: 'user',
    rut: '12345678-5',
  },
  {
    id: '3',
    username: 'maria',
    passwordHash:
      'b65b6ce38a233cb4f8be55397f733edd:c87fbebfbb374d507a8ff4d85d8baecb6f050485197e403d1693764e4a5d0795226efd3bfa4d96f75037545db4ace107dad74c3f9b1b3d8449258d0b76d823c3',
    role: 'user',
    rut: '11111111-1',
  },
];
