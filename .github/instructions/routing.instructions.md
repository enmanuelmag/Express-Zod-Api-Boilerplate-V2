---
applyTo: 'src/routes/**'
---

# Instrucciones para Routing

## Definición de Rutas

### Estructura del Routing

```typescript
import { DependsOnMethod } from 'express-zod-api';
import type { Routing } from 'express-zod-api';

// Importar endpoints
import { getUserEndpoint, updateUserEndpoint } from '@/controllers/users.endpoints';
import { helloWorldEndpoint } from '@/controllers/test';

export const routing: Routing = {
  // Versión de API
  v1: {
    // Recursos
    user: {
      // Path parameters con :
      ':id': new DependsOnMethod({
        get: getUserEndpoint,
        post: updateUserEndpoint,
      }),
    },
    // Endpoints simples
    hello: helloWorldEndpoint,
  },
};
```

### Patrones de Routing

#### 1. Single Endpoint
```typescript
export const routing: Routing = {
  v1: {
    health: healthCheckEndpoint, // GET /v1/health
    hello: helloWorldEndpoint,   // GET /v1/hello
  },
};
```

#### 2. Resource con Path Parameters
```typescript
export const routing: Routing = {
  v1: {
    user: {
      ':id': getUserEndpoint, // GET /v1/user/:id
    },
  },
};
```

#### 3. Múltiples Métodos en la Misma Ruta
```typescript
import { DependsOnMethod } from 'express-zod-api';

export const routing: Routing = {
  v1: {
    user: {
      ':id': new DependsOnMethod({
        get: getUserEndpoint,     // GET /v1/user/:id
        post: updateUserEndpoint, // POST /v1/user/:id
        put: replaceUserEndpoint, // PUT /v1/user/:id
        delete: deleteUserEndpoint, // DELETE /v1/user/:id
      }),
    },
  },
};
```

#### 4. Nested Resources
```typescript
export const routing: Routing = {
  v1: {
    user: {
      ':userId': {
        profile: getUserProfileEndpoint, // GET /v1/user/:userId/profile
        posts: {
          ':postId': new DependsOnMethod({
            get: getUserPostEndpoint,    // GET /v1/user/:userId/posts/:postId
            delete: deleteUserPostEndpoint, // DELETE /v1/user/:userId/posts/:postId
          }),
        },
      },
    },
  },
};
```

#### 5. Collection Endpoints
```typescript
export const routing: Routing = {
  v1: {
    users: new DependsOnMethod({
      get: listUsersEndpoint,    // GET /v1/users
      post: createUserEndpoint,  // POST /v1/users
    }),
    user: {
      ':id': new DependsOnMethod({
        get: getUserEndpoint,     // GET /v1/user/:id
        put: updateUserEndpoint,  // PUT /v1/user/:id
        delete: deleteUserEndpoint, // DELETE /v1/user/:id
      }),
    },
  },
};
```

### Convenciones de Naming

#### 1. Versioning
```typescript
export const routing: Routing = {
  v1: {
    // API version 1
  },
  v2: {
    // API version 2 (cuando sea necesario)
  },
};
```

#### 2. Resource Names
- **Singular** para operaciones en recursos específicos: `user`, `post`, `comment`
- **Plural** para operaciones en colecciones: `users`, `posts`, `comments`

```typescript
export const routing: Routing = {
  v1: {
    // Colecciones (plural)
    users: listUsersEndpoint,
    posts: listPostsEndpoint,
    
    // Recursos individuales (singular)
    user: {
      ':id': getUserEndpoint,
    },
    post: {
      ':id': getPostEndpoint,
    },
  },
};
```

#### 3. Actions en Endpoints
Para acciones que no son CRUD estándar:

```typescript
export const routing: Routing = {
  v1: {
    user: {
      ':id': {
        // Acciones específicas
        activate: activateUserEndpoint,     // POST /v1/user/:id/activate
        deactivate: deactivateUserEndpoint, // POST /v1/user/:id/deactivate
        'reset-password': resetPasswordEndpoint, // POST /v1/user/:id/reset-password
      },
    },
    auth: {
      login: loginEndpoint,    // POST /v1/auth/login
      logout: logoutEndpoint,  // POST /v1/auth/logout
      refresh: refreshTokenEndpoint, // POST /v1/auth/refresh
    },
  },
};
```

### Organización por Módulos

Para proyectos grandes, organizar routing por módulos:

```typescript
// src/routes/users.routes.ts
export const usersRouting = {
  users: new DependsOnMethod({
    get: listUsersEndpoint,
    post: createUserEndpoint,
  }),
  user: {
    ':id': new DependsOnMethod({
      get: getUserEndpoint,
      put: updateUserEndpoint,
      delete: deleteUserEndpoint,
    }),
  },
};

// src/routes/auth.routes.ts
export const authRouting = {
  auth: {
    login: loginEndpoint,
    logout: logoutEndpoint,
    register: registerEndpoint,
    'forgot-password': forgotPasswordEndpoint,
  },
};

// src/routes/index.ts
import { usersRouting } from './users.routes';
import { authRouting } from './auth.routes';

export const routing: Routing = {
  v1: {
    ...usersRouting,
    ...authRouting,
    // Otros módulos...
  },
};
```

### RESTful Patterns

#### CRUD Completo
```typescript
export const routing: Routing = {
  v1: {
    // Collection endpoints
    users: new DependsOnMethod({
      get: listUsersEndpoint,    // GET /v1/users - List all users
      post: createUserEndpoint,  // POST /v1/users - Create new user
    }),
    
    // Individual resource endpoints
    user: {
      ':id': new DependsOnMethod({
        get: getUserEndpoint,     // GET /v1/user/:id - Get specific user
        put: updateUserEndpoint,  // PUT /v1/user/:id - Update entire user
        patch: patchUserEndpoint, // PATCH /v1/user/:id - Partial update
        delete: deleteUserEndpoint, // DELETE /v1/user/:id - Delete user
      }),
    },
  },
};
```

#### Nested Resources
```typescript
export const routing: Routing = {
  v1: {
    user: {
      ':userId': {
        posts: new DependsOnMethod({
          get: getUserPostsEndpoint,    // GET /v1/user/:userId/posts
          post: createUserPostEndpoint, // POST /v1/user/:userId/posts
        }),
        post: {
          ':postId': new DependsOnMethod({
            get: getUserPostEndpoint,     // GET /v1/user/:userId/post/:postId
            put: updateUserPostEndpoint,  // PUT /v1/user/:userId/post/:postId
            delete: deleteUserPostEndpoint, // DELETE /v1/user/:userId/post/:postId
          }),
        },
      },
    },
  },
};
```

### Special Routes

#### Health Check
```typescript
export const routing: Routing = {
  // Sin versión para health check
  health: healthCheckEndpoint, // GET /health
  
  v1: {
    // API endpoints...
  },
};
```

#### Admin Routes
```typescript
export const routing: Routing = {
  v1: {
    admin: {
      users: new DependsOnMethod({
        get: adminListUsersEndpoint,
        post: adminCreateUserEndpoint,
      }),
      system: {
        stats: getSystemStatsEndpoint,
        logs: getSystemLogsEndpoint,
        'clear-cache': clearCacheEndpoint,
      },
    },
  },
};
```

#### Upload Routes
```typescript
export const routing: Routing = {
  v1: {
    upload: {
      image: uploadImageEndpoint,     // POST /v1/upload/image
      document: uploadDocumentEndpoint, // POST /v1/upload/document
      avatar: {
        ':userId': uploadAvatarEndpoint, // POST /v1/upload/avatar/:userId
      },
    },
  },
};
```

### Path Parameters Guidelines

#### Single Parameter
```typescript
user: {
  ':id': getUserEndpoint, // /v1/user/123
}
```

#### Multiple Parameters
```typescript
user: {
  ':userId': {
    post: {
      ':postId': getUserPostEndpoint, // /v1/user/123/post/456
    },
  },
}
```

#### Parameter Naming
- Use descriptive names: `:userId`, `:postId`, `:commentId`
- Be consistent across the API
- Avoid generic names like `:id` when there could be ambiguity

### Query Parameters

Query parameters se manejan en los endpoints, no en el routing:

```typescript
// En el endpoint, no en routing
input: z.object({
  // Path parameters
  id: z.string().transform(id => parseInt(id, 10)),
  
  // Query parameters
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})
```

### Error Handling en Routing

El routing en sí no maneja errores, pero debes estar consciente de:

1. **404 automático** para rutas no definidas
2. **405 automático** para métodos no permitidos en DependsOnMethod
3. **Errores de path parameters** manejados por Zod en endpoints

### Testing Routes

```typescript
// test/routes.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('User Routes', () => {
  it('GET /v1/user/:id should return user', async () => {
    const response = await request(app)
      .get('/v1/user/123')
      .expect(200);
    
    expect(response.body).toHaveProperty('id', 123);
  });
  
  it('POST /v1/users should create user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    
    const response = await request(app)
      .post('/v1/users')
      .send(userData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

### Documentation

Documenta tu estructura de routing:

```typescript
/**
 * API Routing Structure
 * 
 * /health - Health check endpoint
 * 
 * /v1/users - User collection endpoints
 *   GET - List all users with pagination
 *   POST - Create new user
 * 
 * /v1/user/:id - Individual user endpoints
 *   GET - Get user by ID
 *   PUT - Update entire user
 *   PATCH - Partial user update
 *   DELETE - Delete user
 * 
 * /v1/auth - Authentication endpoints
 *   POST /login - User login
 *   POST /logout - User logout
 *   POST /refresh - Refresh token
 */
export const routing: Routing = {
  // Implementation...
};
```
