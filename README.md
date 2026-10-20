# Finance App — API (NestJS)

API REST en Node.js + TypeScript que autentica usuarios con JWT y autoriza por rol (`admin` / `user`) la consulta del score financiero de un RUT.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + TypeScript | Runtime y lenguaje |
| NestJS 11 (`@nestjs/core`, `platform-express`) | Framework HTTP: módulos, controladores, guards y pipes |
| `@nestjs/jwt` | Firma y verificación de JWT (HS256, expiración 60 min) |
| `@nestjs/config` | Carga de variables desde `.env` |
| `class-validator` / `class-transformer` | Validación del body de `POST /login` |
| `node:crypto` | Hash de contraseñas con `scrypt` y score con `SHA-256` |
| Jest + Supertest | Tests e2e |
| ESLint + Prettier | Lint y formato |

## Cómo levantar el proyecto

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
cp .env.example .env    # completar JWT_SECRET y SCORE_SALT
npm run start:dev       # http://localhost:3000 (modo watch)
```

Variables de entorno (`.env`):

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `JWT_SECRET` | Secreto para firmar los JWT. **Obligatorio**: la app no arranca sin él | — |
| `SCORE_SALT` | Sal del hash que calcula el score | `''` |
| `FRONTEND_URL` | Origen permitido por CORS (la SPA) | `http://localhost:5173` |

Otros scripts:

```bash
npm run build && npm run start:prod   # compilar a dist/ y ejecutar
npm run test:e2e                      # tests e2e (login, 401, 403, 400, score)
npm run lint                          # eslint --fix
```

## Endpoints

### `POST /login` (público)

Autentica contra usuarios mock definidos en `src/users/users.data.ts` (sin base de datos; las contraseñas se guardan como hash `scrypt`).

```http
POST /login
Content-Type: application/json

{ "username": "juan", "password": "User123!" }
```

```json
{ "access_token": "<jwt>" }
```

Payload del JWT: `sub` (ID del usuario), `role` (`admin` | `user`) y `rut` (normalizado, **solo** si el rol es `user`). Credenciales inválidas responden `401 Invalid credentials` sin indicar si falló el usuario o la contraseña.

### `GET /score/:rut` (requiere `Authorization: Bearer <jwt>`)

```json
{
  "rut": "12.345.678-5",
  "score": 73,
  "fecha": "2025-06-27T14:35:00Z"
}
```

El RUT se acepta con o sin puntos y guion (`12.345.678-5`, `12345678-5`, `123456785`).

| Status | Causa |
|---|---|
| `200` | OK |
| `400` | RUT con formato o dígito verificador inválido |
| `401` | Token ausente, con firma inválida, expirado o con claims incorrectos |
| `403` | Rol `user` consultando un RUT distinto al de su token |

## Seguridad: guards y pipe

`GET /score/:rut` aplica, en este orden (`src/score/score.controller.ts`):

1. **`JwtAuthGuard`** (autenticación): exige `Bearer`, verifica firma y `exp` con `verifyAsync` restringido a `HS256` y valida la forma de los claims (`sub`, `role`, `exp`, y `rut` si es `user`). Deja el payload en `request.user`.
2. **`RolesGuard`** (autorización por rol): lee los roles declarados con `@Roles('admin', 'user')` vía `Reflector`.
3. **`RutOwnershipGuard`** (autorización por recurso): `admin` pasa siempre; `user` solo si el RUT de la URL, normalizado, coincide con el `rut` del token.
4. **`RutValidationPipe`**: valida formato y dígito verificador (módulo 11) y entrega el RUT normalizado al handler.

## Score determinista

`ScoreService.computeScore` calcula `SHA-256(SCORE_SALT + ":" + rutNormalizado)`, toma los primeros 4 bytes como entero sin signo y aplica `% 101`, obteniendo un valor en `[0, 100]`. El mismo RUT siempre produce el mismo score, RUTs distintos se distribuyen de forma uniforme, y la sal impide que un tercero reproduzca el score conociendo solo el algoritmo. Al normalizar antes de hashear, `12.345.678-5` y `123456785` dan el mismo resultado.

## Estructura

```
src/
├── main.ts                       # bootstrap: CORS y ValidationPipe global
├── app.module.ts                 # ConfigModule global + AuthModule + ScoreModule
├── auth/
│   ├── auth.controller.ts        # POST /login
│   ├── auth.service.ts           # verificación scrypt y firma del JWT
│   ├── auth.module.ts            # JwtModule (HS256, 60m) y exports de guards
│   ├── decorators/roles.decorator.ts
│   ├── dto/login.dto.ts
│   └── guards/
│       ├── jwt-auth.guard.ts     # autenticación
│       ├── roles.guard.ts        # autorización por rol
│       └── rut-ownership.guard.ts# autorización por RUT
├── score/
│   ├── score.controller.ts       # GET /score/:rut
│   ├── score.service.ts          # algoritmo determinista
│   └── score.module.ts
├── users/
│   ├── users.data.ts             # usuarios mock con hash scrypt
│   ├── users.service.ts
│   └── users.module.ts
└── common/
    ├── rut.util.ts               # normalizar, validar DV, formatear
    └── pipes/rut-validation.pipe.ts
test/
└── app.e2e-spec.ts               # flujo completo con Supertest
```

## Uso de herramientas de IA

El detalle de qué herramientas se usaron y qué partes del código apoyaron está en [ai_interactions.md](./ai_interactions.md).
