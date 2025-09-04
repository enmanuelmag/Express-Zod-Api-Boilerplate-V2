---
applyTo: 'src/controllers/**'
---

# Instrucciones para Endpoints

## Creación de Endpoints

### Factory Pattern
SIEMPRE usar las factories de express-zod-api:

```typescript
import { taggedEndpointsFactory } from "@/factories";
import { methodProviderMiddleware } from "@/middlewares";
```

### Estructura Básica de Endpoint

```typescript
export const myEndpoint = taggedEndpointsFactory
  .addMiddleware(methodProviderMiddleware) // Si necesitas el método HTTP
  .build({
    method: "get", // get, post, put, delete, patch
    tag: "resource-name", // Para agrupación en docs
    shortDescription: "Una línea describiendo qué hace",
    description: "Descripción más detallada del endpoint",
    input: z.object({
      // Esquema de entrada
    }),
    output: z.object({
      // Esquema de salida
    }),
    handler: async ({ input, options, logger }) => {
      // Lógica del endpoint
    }
  });
```

### Input Schema Guidelines

1. **Path Parameters**: Usar transforms para conversión de tipos
```typescript
input: z.object({
  id: z.string()
    .regex(/\d+/)
    .transform(id => parseInt(id, 10))
    .describe("a numeric string containing the id"),
})
```

2. **Query Parameters**: Siempre opcionales si no son requeridos
```typescript
input: z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(10),
})
```

3. **Body Parameters**: Validar tipos estrictamente
```typescript
input: z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().min(0).max(120),
})
```

### Output Schema Guidelines

1. **Usar ez helpers para tipos especiales**:
```typescript
import { ez } from "express-zod-api";

output: z.object({
  id: z.number(),
  createdAt: ez.dateOut(),
  file: ez.file(), // Para archivos
})
```

2. **Siempre incluir examples**:
```typescript
.example({
  id: 123,
  name: "John Doe",
  createdAt: "2023-01-01T00:00:00Z"
})
```

### Handler Guidelines

1. **Destructuring de parámetros**:
```typescript
handler: async ({ input: { id, name }, options: { method }, logger }) => {
  // Usar parámetros destructurados
}
```

2. **Logging apropiado**:
```typescript
logger.debug(`Processing request for ID: ${id}`);
logger.warn("Something unexpected happened");
logger.error("Critical error occurred");
```

3. **Error handling**:
```typescript
import createHttpError from "http-errors";

// Para errores HTTP estándar
if (!found) throw createHttpError(404, "Resource not found");
if (!authorized) throw createHttpError(401, "Unauthorized");
if (invalid) throw createHttpError(400, "Invalid input");

// Para errores de servidor
throw createHttpError(500, "Internal server error");
```

4. **Manejo seguro de async**:
```typescript
import { safeAsync } from "@/utils";

const result = await safeAsync(async () => await riskyOperation());
if (!result.ok) {
  logger.error(`Operation failed: ${result.data}`);
  throw createHttpError(500, "Operation failed");
}
```

### Tags Recomendados

Usar tags descriptivos para agrupación en documentación:
- `users` - Operaciones de usuarios
- `auth` - Autenticación y autorización
- `upload` - Subida de archivos
- `admin` - Operaciones administrativas
- `health` - Health checks y status

### Middleware Usage

1. **methodProviderMiddleware**: Para acceder al método HTTP
2. **Crear middlewares específicos** cuando sea necesario:
```typescript
const authMiddleware = new Middleware({
  input: z.object({
    authorization: z.string().optional()
  }),
  handler: async ({ input: { authorization } }) => {
    // Lógica de autenticación
    return { userId: 123 };
  }
});
```

### Naming Conventions

1. **Endpoints**: `{verb}{Resource}Endpoint`
   - `getUserEndpoint`
   - `createUserEndpoint`
   - `updateUserEndpoint`
   - `deleteUserEndpoint`

2. **Archivos**: `{resource}.endpoints.ts`
   - `users.endpoints.ts`
   - `auth.endpoints.ts`
   - `upload.endpoints.ts`

### Ejemplos Completos

#### GET Endpoint
```typescript
export const getUserEndpoint = taggedEndpointsFactory
  .addMiddleware(methodProviderMiddleware)
  .build({
    method: "get",
    tag: "users",
    shortDescription: "Get user by ID",
    description: "Retrieves a single user by their unique identifier",
    input: z.object({
      id: z.string()
        .regex(/\d+/)
        .transform(id => parseInt(id, 10))
        .describe("User's unique identifier")
    }),
    output: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      createdAt: ez.dateOut()
    }).example({
      id: 123,
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2023-01-01T00:00:00Z"
    }),
    handler: async ({ input: { id }, logger }) => {
      logger.debug(`Fetching user with ID: ${id}`);
      
      if (id > 1000) {
        throw createHttpError(404, "User not found");
      }
      
      return {
        id,
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date()
      };
    }
  });
```

#### POST Endpoint
```typescript
export const createUserEndpoint = taggedEndpointsFactory
  .build({
    method: "post",
    tag: "users",
    shortDescription: "Create new user",
    description: "Creates a new user with the provided information",
    input: z.object({
      name: z.string().min(1).max(255),
      email: z.string().email(),
      age: z.number().min(0).max(120).optional()
    }).example({
      name: "Jane Doe",
      email: "jane@example.com",
      age: 25
    }),
    output: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      createdAt: ez.dateOut()
    }),
    handler: async ({ input: { name, email, age }, logger }) => {
      logger.debug(`Creating user: ${name}`);
      
      // Validaciones de negocio
      if (email.includes("spam")) {
        throw createHttpError(400, "Invalid email domain");
      }
      
      return {
        id: Date.now(),
        name,
        email,
        createdAt: new Date()
      };
    }
  });
```
