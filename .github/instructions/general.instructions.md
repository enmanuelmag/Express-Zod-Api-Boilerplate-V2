---
applyTo: '**'
---

# Express Zod API Boilerplate V2 - Instrucciones Generales

Este proyecto es un boilerplate mínimo y opinado para APIs REST usando Express.js con Zod para validación de esquemas y TypeScript para type safety. Está diseñado para ser production-ready y fácil de extender.

## Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── configs/         # Configuraciones del sistema
├── controllers/     # Endpoints y lógica de controladores
├── factories/       # Factories de express-zod-api
├── middlewares/     # Middlewares personalizados
├── models/          # Esquemas de Zod y tipos
├── routes/          # Definición de rutas
├── scripts/         # Scripts de generación automática
├── services/        # Lógica de negocio
└── utils/          # Utilidades y helpers
```

### Tecnologías Principales

- **Express.js 5.x**: Framework web
- **express-zod-api**: Integración entre Express y Zod para endpoints type-safe
- **Zod**: Validación de esquemas y type inference
- **TypeScript**: Type safety y desarrollo moderno
- **ESM**: Módulos ES nativo (NO CommonJS)

## Patrones de Desarrollo

### 1. Definición de Endpoints

Los endpoints SIEMPRE deben ser definidos usando `express-zod-api` factories:

```typescript
// Para endpoints con tags y middlewares
export const getUserEndpoint = taggedEndpointsFactory
  .addMiddleware(methodProviderMiddleware)
  .build({
    method: "get",
    tag: "users",
    shortDescription: "Descripción corta",
    description: "Descripción detallada",
    input: z.object({
      id: z.string().transform(id => parseInt(id, 10))
    }),
    output: z.object({
      data: z.string()
    }),
    handler: async ({ input, options, logger }) => {
      // Lógica del endpoint
    }
  });

// Para endpoints simples
export const simpleEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({}),
  handler: async ({ input, logger }) => {
    // Lógica del endpoint
  }
});
```

### 2. Routing con DependsOnMethod

Para múltiples métodos HTTP en la misma ruta:

```typescript
import { DependsOnMethod } from 'express-zod-api';

export const routing: Routing = {
  v1: {
    user: {
      ':id': new DependsOnMethod({
        get: getUserEndpoint,
        post: updateUserEndpoint,
      }),
    },
  },
};
```

### 3. Validación de Esquemas con Zod

- **SIEMPRE** usar Zod para validación
- **SIEMPRE** definir schemas en `src/models/`
- Usar `.transform()` para conversión de tipos
- Usar `.describe()` para documentación automática

```typescript
// En src/models/
export const UserInputSchema = z.object({
  id: z.string()
    .regex(/\d+/)
    .transform(id => parseInt(id, 10))
    .describe("a numeric string containing the user id"),
  name: z.string().min(1),
});

export const UserOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: ez.dateOut(),
});
```

### 4. Configuración y Variables de Entorno

- Todas las variables de entorno DEBEN estar en `src/models/app.ts`
- Usar `z.coerce` para conversión automática
- Siempre proporcionar valores por defecto

```typescript
export const EnvFileSchema = z.object({
  PORT: z.coerce.number().default(8090),
  CORS_ENABLED: z.coerce.boolean().default(true),
  // ...más configuraciones
});
```

### 5. Manejo de Errores

- Usar `createHttpError` para errores HTTP estándar
- Implementar manejo seguro de async con utilidades `safe` y `safeAsync`

```typescript
import createHttpError from "http-errors";
import { safeAsync } from "@/utils";

// Error HTTP
if (id > 100) throw createHttpError(404, "User not found");

// Manejo seguro de async
const result = await safeAsync(async () => await riskyOperation());
if (!result.ok) {
  logger.error(result.data);
  // Manejar error
}
```

### 6. Middlewares

- Crear middlewares usando la clase `Middleware` de express-zod-api
- SIEMPRE definir input schema (usar `z.object({})` si está vacío)
- Retornar objetos tipados para `options`

```typescript
export const methodProviderMiddleware = new Middleware({
  input: z.object({}),
  handler: async ({ request }) => {
    return { method: request.method.toLowerCase() as Method };
  },
});
```

### 7. Servicios

- Mantener la lógica de negocio en `src/services/`
- Usar async/await consistentemente
- Implementar proper error handling

### 8. Imports y Aliases

- Usar alias `@/` para imports internos
- Seguir el orden de imports definido en ESLint:
  1. Built-in/external modules
  2. Internal modules (con @/)
  3. Relative imports

```typescript
import { createServer } from "express-zod-api";
import createHttpError from "http-errors";

import { envConfig, zodConfig } from "@/configs";
import { safeAsync } from "@/utils";

import { localHelper } from "./helper";
```

## Comandos y Scripts

### Desarrollo
- `npm run dev`: Desarrollo con hot-reload
- `npm run dev:no-reload`: Desarrollo sin hot-reload

### Build y Producción
- `npm run build`: Build para producción
- `npm run start`: Ejecutar build de producción

### Calidad de Código
- `npm run lint`: Ejecutar linter
- `npm run lint:fix`: Ejecutar linter con auto-fix

### Generación Automática
- `npm run generate:client`: Generar cliente TypeScript
- `npm run generate:docs`: Generar documentación OpenAPI

### Docker
- `npm run docker:build`: Build imagen de producción
- `npm run docker:run`: Ejecutar imagen de producción
- `npm run docker:build:dev`: Build imagen de desarrollo
- `npm run docker:run:dev`: Ejecutar imagen de desarrollo

## Configuraciones Importantes

### Variables de Entorno (.env)

```bash
PORT=8090                          # Puerto del servidor
CORS_ENABLED=true                  # Habilitar CORS
LOG_LEVEL=debug                    # Nivel de logging
COMPRESSION_ENABLED=true           # Habilitar compresión
UPLOAD_ENABLED=true               # Habilitar uploads
GENERATE_CLIENT=true              # Auto-generar cliente
GENERATE_API_DOCS=true            # Auto-generar docs
API_VERSION=0.0.1                 # Versión de la API
API_TITLE=my-api                  # Título de la API
API_SERVER_URL=http://localhost:8090/v1  # URL base
```

### TypeScript Configuration

- Target: ES2020
- Module: ESNext (NO CommonJS)
- Strict mode habilitado
- Aliases configurados para `@/*`

## Reglas de Desarrollo

1. **NUNCA** usar CommonJS (`require`/`module.exports`)
2. **SIEMPRE** usar ESM (`import`/`export`)
3. **SIEMPRE** validar con Zod
4. **SIEMPRE** usar TypeScript estricto
5. **SIEMPRE** documentar endpoints con descriptions
6. **SIEMPRE** usar factories de express-zod-api
7. **SIEMPRE** manejar errores apropiadamente
8. **SIEMPRE** usar aliases para imports internos
9. **SIEMPRE** seguir la estructura de directorios
10. **SIEMPRE** usar el linter configurado

## Generación Automática

Este proyecto genera automáticamente:

1. **Cliente TypeScript** (`src/client/client.ts`): Para usar en frontend
2. **Documentación OpenAPI** (`src/docs/api.yaml`): Para Swagger/Postman

Ambos se generan automáticamente en desarrollo y pueden generarse manualmente en producción.

## Docker y Producción

- Dockerfile multi-stage optimizado
- PM2 para gestión de procesos en producción
- Configuración de clusters automática
- Usuario no-root para seguridad