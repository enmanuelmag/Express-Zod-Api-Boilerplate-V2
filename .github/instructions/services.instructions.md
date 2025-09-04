---
applyTo: 'src/services/**'
---

# Instrucciones para Servicios

## Arquitectura de Servicios

Los servicios contienen la lógica de negocio de la aplicación. Deben ser independientes de Express y reutilizables.

### Estructura Básica

```typescript
// Ejemplo: src/services/user.service.ts
import createHttpError from "http-errors";
import { safeAsync } from "@/utils";

export class UserService {
  async getUserById(id: number): Promise<User> {
    // Lógica de negocio
  }
  
  async createUser(userData: CreateUserData): Promise<User> {
    // Lógica de negocio
  }
}

// Exportar instancia singleton
export const userService = new UserService();
```

### Naming Conventions

1. **Archivos**: `{resource}.service.ts`
   - `user.service.ts`
   - `auth.service.ts`
   - `email.service.ts`

2. **Clases**: `{Resource}Service`
   - `UserService`
   - `AuthService`
   - `EmailService`

3. **Métodos**: Usar verbos descriptivos
   - `getUserById(id: number)`
   - `createUser(data: CreateUserData)`
   - `updateUserProfile(id: number, data: UpdateUserData)`
   - `deleteUser(id: number)`
   - `searchUsers(criteria: SearchCriteria)`

### Error Handling

```typescript
import createHttpError from "http-errors";

export class UserService {
  async getUserById(id: number): Promise<User> {
    // Validación de entrada
    if (id <= 0) {
      throw createHttpError(400, "Invalid user ID");
    }
    
    // Lógica de negocio
    const user = await this.findUserInDatabase(id);
    
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    
    return user;
  }
  
  private async findUserInDatabase(id: number): Promise<User | null> {
    // Operación que puede fallar
    const result = await safeAsync(async () => {
      return await database.user.findUnique({ where: { id } });
    });
    
    if (!result.ok) {
      // Log el error pero no expongas detalles internos
      console.error(`Database error: ${result.data}`);
      throw createHttpError(500, "Failed to retrieve user");
    }
    
    return result.data;
  }
}
```

### Manejo Seguro de Async

```typescript
import { safeAsync } from "@/utils";

export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const result = await safeAsync(async () => {
      return await this.emailProvider.send({
        to: email,
        subject: "Welcome!",
        template: "welcome",
        data: { name }
      });
    });
    
    if (!result.ok) {
      // Log para debugging pero no fallar la operación principal
      console.error(`Failed to send email: ${result.data}`);
      return false;
    }
    
    return true;
  }
}
```

### Inyección de Dependencias

```typescript
// Interfaces para dependencias
interface DatabaseClient {
  user: {
    findUnique(params: any): Promise<User | null>;
    create(params: any): Promise<User>;
    update(params: any): Promise<User>;
    delete(params: any): Promise<User>;
  };
}

interface EmailProvider {
  send(params: EmailParams): Promise<void>;
}

// Servicio con dependencias
export class UserService {
  constructor(
    private db: DatabaseClient,
    private emailService: EmailService
  ) {}
  
  async createUser(userData: CreateUserData): Promise<User> {
    // Crear usuario
    const user = await this.db.user.create({
      data: userData
    });
    
    // Enviar email de bienvenida (no crítico)
    await this.emailService.sendWelcomeEmail(user.email, user.name);
    
    return user;
  }
}

// Factory pattern para instanciar
export function createUserService(): UserService {
  const db = createDatabaseClient();
  const emailService = createEmailService();
  return new UserService(db, emailService);
}

// Singleton para uso general
export const userService = createUserService();
```

### Validación en Servicios

```typescript
import { z } from "zod";

// Schemas internos del servicio
const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
});

export class UserService {
  async createUser(userData: unknown): Promise<User> {
    // Validar entrada en el servicio
    const validData = CreateUserSchema.parse(userData);
    
    // Validaciones de negocio
    await this.validateUniqueEmail(validData.email);
    
    // Crear usuario
    return await this.db.user.create({
      data: validData
    });
  }
  
  private async validateUniqueEmail(email: string): Promise<void> {
    const existing = await this.db.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      throw createHttpError(409, "Email already registered");
    }
  }
}
```

### Paginación y Filtros

```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  async getUsers(
    pagination: PaginationParams,
    filters: UserFilters = {}
  ): Promise<PaginatedResult<User>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    
    // Construir where clause
    const where = this.buildWhereClause(filters);
    
    // Ejecutar queries en paralelo
    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.db.user.count({ where })
    ]);
    
    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  private buildWhereClause(filters: UserFilters) {
    const where: any = {};
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.active !== undefined) {
      where.active = filters.active;
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    
    return where;
  }
}
```

### Transacciones

```typescript
export class UserService {
  async createUserWithProfile(
    userData: CreateUserData,
    profileData: CreateProfileData
  ): Promise<{ user: User; profile: Profile }> {
    return await this.db.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: userData
      });
      
      // Crear perfil
      const profile = await tx.profile.create({
        data: {
          ...profileData,
          userId: user.id
        }
      });
      
      // Enviar email de bienvenida (fuera de la transacción)
      this.sendWelcomeEmailAsync(user.email, user.name);
      
      return { user, profile };
    });
  }
  
  private async sendWelcomeEmailAsync(email: string, name: string): Promise<void> {
    // Ejecutar en background sin bloquear
    setImmediate(async () => {
      await this.emailService.sendWelcomeEmail(email, name);
    });
  }
}
```

### Caché

```typescript
interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class UserService {
  constructor(
    private db: DatabaseClient,
    private cache: CacheProvider
  ) {}
  
  async getUserById(id: number): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Intentar obtener del caché
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Obtener de la base de datos
    const user = await this.db.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    
    // Guardar en caché por 5 minutos
    await this.cache.set(cacheKey, user, 300);
    
    return user;
  }
  
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const user = await this.db.user.update({
      where: { id },
      data
    });
    
    // Invalidar caché
    await this.cache.del(`user:${id}`);
    
    return user;
  }
}
```

### Testing

```typescript
// Mock para testing
export const createMockUserService = (): jest.Mocked<UserService> => ({
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUsers: jest.fn(),
});

// Test example
describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<DatabaseClient>;
  
  beforeEach(() => {
    mockDb = createMockDatabase();
    userService = new UserService(mockDb);
  });
  
  it('should get user by id', async () => {
    const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
    mockDb.user.findUnique.mockResolvedValue(mockUser);
    
    const result = await userService.getUserById(1);
    
    expect(result).toEqual(mockUser);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
  });
});
```

### Export Pattern

En `src/services/index.ts`:

```typescript
// Servicios individuales
export { userService, UserService } from './user.service';
export { authService, AuthService } from './auth.service';
export { emailService, EmailService } from './email.service';

// Funciones de utilidad
export { exampleWithRandomThrow } from './example.service';

// Re-exports de tipos si es necesario
export type { CreateUserData, UpdateUserData } from './user.service';
```

### Consideraciones de Performance

1. **Lazy loading** de dependencias pesadas
2. **Connection pooling** para bases de datos
3. **Batch operations** cuando sea posible
4. **Timeouts** para operaciones externas
5. **Circuit breakers** para servicios externos
6. **Retry logic** con exponential backoff

### Logging en Servicios

```typescript
// No depender del logger de express-zod-api
export class UserService {
  private logger = console; // O tu logger preferido
  
  async createUser(userData: CreateUserData): Promise<User> {
    this.logger.debug(`Creating user with email: ${userData.email}`);
    
    try {
      const user = await this.db.user.create({ data: userData });
      this.logger.info(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error}`);
      throw createHttpError(500, "Failed to create user");
    }
  }
}
```
