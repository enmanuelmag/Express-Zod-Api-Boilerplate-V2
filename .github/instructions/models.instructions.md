---
applyTo: 'src/models/**'
---

# Instrucciones para Modelos y Esquemas

## Definición de Esquemas con Zod

### Estructura de Archivos
- `app.ts` - Configuración de la aplicación y variables de entorno
- `{resource}.ts` - Esquemas específicos por recurso
- `index.ts` - Exports centralizados

### Variables de Entorno

SIEMPRE definir en `src/models/app.ts`:

```typescript
import { z } from 'zod';

export const EnvFileSchema = z.object({
  // Servidor
  PORT: z.coerce.number().default(8090),
  
  // Features
  CORS_ENABLED: z.coerce.boolean().default(true),
  COMPRESSION_ENABLED: z.coerce.boolean().default(true),
  UPLOAD_ENABLED: z.coerce.boolean().default(true),
  
  // Logging
  LOG_LEVEL: z.enum(['silent', 'warn', 'debug']).default('debug'),
  LOG_COLORED: z.coerce.boolean().default(true),
  
  // Generación automática
  GENERATE_CLIENT: z.coerce.boolean().default(true),
  GENERATE_API_DOCS: z.coerce.boolean().default(true),
  
  // API Info
  API_VERSION: z.coerce.string().default('0.0.1'),
  API_TITLE: z.coerce.string().default('my-api'),
  API_SERVER_URL: z.coerce.string().default('http://localhost:8090/v1'),
});

export const Environment = z.enum(['production', 'development']);
```

### Esquemas de Recursos

#### Naming Conventions
- Input schemas: `{Resource}InputSchema`
- Output schemas: `{Resource}OutputSchema`
- Base schemas: `{Resource}Schema`
- Update schemas: `Update{Resource}Schema`

#### Estructura Básica

```typescript
import { z } from 'zod';
import { ez } from 'express-zod-api';

// Schema base
export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Para inputs (requests)
export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserInputSchema = CreateUserInputSchema.partial();

export const UserIdInputSchema = z.object({
  id: z.string()
    .regex(/\d+/)
    .transform(id => parseInt(id, 10))
    .describe("User's unique identifier"),
});

// Para outputs (responses)
export const UserOutputSchema = UserSchema.extend({
  createdAt: ez.dateOut(),
  updatedAt: ez.dateOut(),
});

export const UserListOutputSchema = z.object({
  users: z.array(UserOutputSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
```

### Tipos Comunes

#### Transformaciones
```typescript
// String a número
id: z.string()
  .regex(/\d+/)
  .transform(id => parseInt(id, 10))

// String a boolean
active: z.string()
  .transform(val => val === 'true')

// String a fecha
date: z.string()
  .transform(str => new Date(str))

// Coerción automática
port: z.coerce.number().default(8090)
enabled: z.coerce.boolean().default(true)
```

#### Validaciones Comunes
```typescript
// Email
email: z.string().email()

// URL
website: z.string().url()

// UUID
uuid: z.string().uuid()

// Longitud de strings
name: z.string().min(1).max(255)
description: z.string().max(1000).optional()

// Números
age: z.number().min(0).max(120)
price: z.number().positive()
quantity: z.number().int().min(1)

// Enums
status: z.enum(['active', 'inactive', 'pending'])
role: z.enum(['user', 'admin', 'moderator'])

// Arrays
tags: z.array(z.string()).min(1).max(10)
ids: z.array(z.number().int().positive())

// Fechas con ez
createdAt: ez.dateOut()
```

#### Esquemas Reutilizables
```typescript
// Paginación
export const PaginationInputSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const PaginationOutputSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// Sorting
export const SortInputSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Filtros comunes
export const DateRangeInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
```

### Ejemplos y Documentación

```typescript
export const UserInputSchema = z.object({
  name: z.string()
    .min(1)
    .max(255)
    .describe("User's full name"),
  email: z.string()
    .email()
    .describe("User's email address"),
  age: z.number()
    .min(0)
    .max(120)
    .optional()
    .describe("User's age in years"),
}).example({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});
```

### Relaciones

```typescript
// Para referencias simples
export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  authorId: z.number(),
  // ... otros campos
});

// Para objetos embebidos
export const PostWithAuthorSchema = PostSchema.extend({
  author: UserOutputSchema,
});

// Para arrays de relaciones
export const UserWithPostsSchema = UserOutputSchema.extend({
  posts: z.array(PostSchema),
});
```

### Validaciones Personalizadas

```typescript
// Validación custom
password: z.string()
  .min(8)
  .refine(val => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter"
  })
  .refine(val => /[0-9]/.test(val), {
    message: "Password must contain at least one number"
  })

// Validación condicional
registration: z.object({
  type: z.enum(['individual', 'company']),
  name: z.string(),
  companyName: z.string().optional(),
}).refine(data => {
  if (data.type === 'company' && !data.companyName) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for company registration",
  path: ["companyName"]
})
```

### Uniones y Discriminated Unions

```typescript
// Unión simple
export const IdSchema = z.union([
  z.number().int().positive(),
  z.string().uuid()
]);

// Discriminated union
export const NotificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    email: z.string().email(),
    subject: z.string(),
  }),
  z.object({
    type: z.literal('sms'),
    phone: z.string(),
    message: z.string(),
  }),
]);
```

### Export Pattern

En `src/models/index.ts`:

```typescript
// App configuration
export * from './app';

// Resource schemas
export * from './user';
export * from './post';
export * from './auth';

// Common schemas
export * from './common';
```

### Error Schemas

```typescript
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: ez.dateOut(),
});

export const ValidationErrorSchema = z.object({
  error: z.literal('Validation Error'),
  message: z.string(),
  statusCode: z.literal(400),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })),
});
```
