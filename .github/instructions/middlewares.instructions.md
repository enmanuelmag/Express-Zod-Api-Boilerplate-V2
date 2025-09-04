---
applyTo: 'src/middlewares/**'
---

# Instrucciones para Middlewares

## Creación de Middlewares

### Estructura Básica

```typescript
import { Middleware } from "express-zod-api";
import { z } from "zod";

export const myMiddleware = new Middleware({
  input: z.object({
    // Schema de entrada (headers, query params, etc.)
  }),
  handler: async ({ input, request, response, logger }) => {
    // Lógica del middleware
    return {
      // Datos a agregar a options
    };
  },
});
```

### Input Schema Guidelines

1. **Headers Authentication**:
```typescript
input: z.object({
  authorization: z.string()
    .optional()
    .describe("Bearer token for authentication"),
})
```

2. **Para middleware sin input específico**:
```typescript
input: z.object({}) // Siempre requerido, usar objeto vacío
```

3. **Query parameters globales**:
```typescript
input: z.object({
  'x-api-version': z.string().optional(),
  'x-client-id': z.string().optional(),
})
```

### Handler Guidelines

1. **Acceso a request/response**:
```typescript
handler: async ({ input, request, response, logger }) => {
  // Request data
  const method = request.method;
  const url = request.url;
  const userAgent = request.get('User-Agent');
  
  // Response manipulation (si es necesario)
  response.setHeader('X-Custom-Header', 'value');
}
```

2. **Logging apropiado**:
```typescript
logger.debug(`Middleware executed for ${request.method} ${request.url}`);
logger.warn("Authentication token missing");
logger.error("Critical authentication failure");
```

3. **Return value** (para pasar datos a endpoints):
```typescript
return {
  userId: 123,
  userRole: 'admin',
  requestId: generateRequestId(),
};
```

### Middlewares Comunes

#### 1. Method Provider (ya existe)
```typescript
export const methodProviderMiddleware = new Middleware({
  input: z.object({}),
  handler: async ({ request }) => {
    return { method: request.method.toLowerCase() as Method };
  },
});
```

#### 2. Authentication Middleware
```typescript
export const authMiddleware = new Middleware({
  input: z.object({
    authorization: z.string()
      .regex(/^Bearer .+/)
      .optional()
      .describe("Bearer token for authentication"),
  }),
  handler: async ({ input: { authorization }, logger }) => {
    if (!authorization) {
      throw createHttpError(401, "Authorization header required");
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Validar token (ejemplo simple)
    const userId = await validateToken(token);
    if (!userId) {
      throw createHttpError(401, "Invalid or expired token");
    }
    
    logger.debug(`Authenticated user: ${userId}`);
    
    return {
      userId,
      isAuthenticated: true,
    };
  },
});
```

#### 3. Rate Limiting Middleware
```typescript
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = new Middleware({
  input: z.object({
    'x-forwarded-for': z.string().optional(),
  }),
  handler: async ({ input, request, logger }) => {
    const clientIp = input['x-forwarded-for'] || 
                     request.connection.remoteAddress || 
                     'unknown';
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 100;
    
    const clientData = rateLimitStore.get(clientIp) || { count: 0, resetTime: now + windowMs };
    
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }
    
    rateLimitStore.set(clientIp, clientData);
    
    if (clientData.count > maxRequests) {
      logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
      throw createHttpError(429, "Too many requests");
    }
    
    logger.debug(`Request ${clientData.count}/${maxRequests} for IP: ${clientIp}`);
    
    return {
      requestCount: clientData.count,
      clientIp,
    };
  },
});
```

#### 4. Request ID Middleware
```typescript
import { randomUUID } from 'crypto';

export const requestIdMiddleware = new Middleware({
  input: z.object({
    'x-request-id': z.string().optional(),
  }),
  handler: async ({ input, response, logger }) => {
    const requestId = input['x-request-id'] || randomUUID();
    
    // Agregar a response headers
    response.setHeader('X-Request-ID', requestId);
    
    logger.debug(`Request ID: ${requestId}`);
    
    return { requestId };
  },
});
```

#### 5. CORS Middleware (si necesitas custom)
```typescript
export const corsMiddleware = new Middleware({
  input: z.object({
    origin: z.string().optional(),
  }),
  handler: async ({ input: { origin }, response, logger }) => {
    const allowedOrigins = ['http://localhost:3000', 'https://myapp.com'];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return { corsEnabled: true };
  },
});
```

#### 6. Logging Middleware
```typescript
export const loggingMiddleware = new Middleware({
  input: z.object({}),
  handler: async ({ request, logger }) => {
    const startTime = Date.now();
    
    logger.info(`${request.method} ${request.url} - Started`);
    
    // Usar en endpoint para log de finalización
    return {
      startTime,
      logEndpoint: (statusCode: number) => {
        const duration = Date.now() - startTime;
        logger.info(`${request.method} ${request.url} - ${statusCode} (${duration}ms)`);
      }
    };
  },
});
```

### Combinando Middlewares

```typescript
// En endpoint
export const protectedEndpoint = taggedEndpointsFactory
  .addMiddleware(requestIdMiddleware)
  .addMiddleware(authMiddleware)
  .addMiddleware(rateLimitMiddleware)
  .build({
    method: "get",
    tag: "protected",
    input: z.object({}),
    output: z.object({
      message: z.string(),
      userId: z.number(),
      requestId: z.string(),
    }),
    handler: async ({ options: { userId, requestId }, logger }) => {
      return {
        message: "Protected resource accessed",
        userId,
        requestId,
      };
    },
  });
```

### Error Handling en Middlewares

```typescript
import createHttpError from "http-errors";

export const errorProneMiddleware = new Middleware({
  input: z.object({}),
  handler: async ({ logger }) => {
    try {
      // Operación que puede fallar
      const result = await riskyOperation();
      return { result };
    } catch (error) {
      logger.error(`Middleware error: ${error}`);
      
      // Lanzar error HTTP apropiado
      if (error instanceof AuthenticationError) {
        throw createHttpError(401, "Authentication failed");
      }
      
      if (error instanceof ValidationError) {
        throw createHttpError(400, error.message);
      }
      
      // Error genérico
      throw createHttpError(500, "Internal server error");
    }
  },
});
```

### Testing Middlewares

```typescript
// Ejemplo de cómo se podría testear (conceptual)
describe('authMiddleware', () => {
  it('should authenticate valid token', async () => {
    const mockRequest = {
      get: jest.fn().mockReturnValue('Bearer valid-token'),
    };
    
    const result = await authMiddleware.handler({
      input: { authorization: 'Bearer valid-token' },
      request: mockRequest,
      logger: mockLogger,
    });
    
    expect(result.isAuthenticated).toBe(true);
    expect(result.userId).toBeDefined();
  });
});
```

### Naming Conventions

- Archivos: `{purpose}.middleware.ts`
  - `auth.middleware.ts`
  - `rateLimit.middleware.ts`
  - `logging.middleware.ts`

- Variables: `{purpose}Middleware`
  - `authMiddleware`
  - `rateLimitMiddleware`
  - `loggingMiddleware`

### Export Pattern

En `src/middlewares/index.ts`:

```typescript
export { methodProviderMiddleware } from './methodProvider.middleware';
export { authMiddleware } from './auth.middleware';
export { rateLimitMiddleware } from './rateLimit.middleware';
export { requestIdMiddleware } from './requestId.middleware';
export { loggingMiddleware } from './logging.middleware';
```

### Consideraciones de Performance

1. **Caché de validaciones costosas**
2. **Avoid blocking operations** en middlewares críticos
3. **Lazy loading** de dependencias pesadas
4. **Timeouts** para operaciones externas (ej. validación de tokens)

### Middleware Order

El orden importa. Generalmente:

1. **requestIdMiddleware** - Primero para tracking
2. **loggingMiddleware** - Temprano para capturar todo
3. **corsMiddleware** - Si es custom
4. **rateLimitMiddleware** - Antes de autenticación
5. **authMiddleware** - Después de rate limiting
6. **methodProviderMiddleware** - Utilidad general
