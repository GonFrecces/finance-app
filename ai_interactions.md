# Uso de herramientas de IA

| Herramienta | Uso |
|---|---|
| ChatGPT | Referencia para implementar los guards a partir de la documentación oficial de NestJS (https://docs.nestjs.com/guards). |
| Claude (Anthropic) | Revisión de `auth` y los guards existentes, y generación de: `POST /login` (AuthController/AuthService, usuarios mock con hash scrypt), `GET /score/:rut` (ScoreModule con score determinista SHA-256), `RutOwnershipGuard`, `RutValidationPipe` y utilidades de RUT (módulo 11), configuración de `ConfigModule`/CORS y los tests unitarios y e2e. |

Todo el código generado fue revisado y probado manualmente y con `npm test` / `npm run test:e2e`.
