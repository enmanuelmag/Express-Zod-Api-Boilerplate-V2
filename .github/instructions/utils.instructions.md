---
applyTo: 'src/utils/**'
---

# Instrucciones para Utilidades

## Safe Execution Utilities

### Funciones de Seguridad (ya implementadas)

```typescript
interface SafeReturn<T> {
  ok: boolean;
  data: T | string;
}

// Para funciones síncronas
export function safe<T>(fn: () => T): SafeReturn<T>;

// Para funciones asíncronas
export async function safeAsync<T>(fn: () => Promise<T>): Promise<SafeReturn<T>>;
```

### Uso de Safe Utilities

```typescript
import { safe, safeAsync } from "@/utils";

// Operación síncrona
const result = safe(() => JSON.parse(jsonString));
if (result.ok) {
  // result.data es el valor parseado
  console.log(result.data);
} else {
  // result.data es el mensaje de error
  console.error(result.data);
}

// Operación asíncrona
const asyncResult = await safeAsync(async () => {
  return await fetch('https://api.example.com/data');
});

if (asyncResult.ok) {
  // asyncResult.data es la Response
  const data = await asyncResult.data.json();
} else {
  // asyncResult.data es el mensaje de error
  logger.error(`API call failed: ${asyncResult.data}`);
}
```

## Utilidades Adicionales Recomendadas

### Validación y Transformación

```typescript
// src/utils/validation.ts
import { z } from "zod";

/**
 * Valida datos de forma segura sin lanzar errores
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): SafeReturn<T> {
  return safe(() => schema.parse(data));
}

/**
 * Transforma un string en número de forma segura
 */
export function safeParseInt(value: string): SafeReturn<number> {
  return safe(() => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error("Invalid number");
    }
    return num;
  });
}

/**
 * Transforma un string en fecha de forma segura
 */
export function safeParseDate(value: string): SafeReturn<Date> {
  return safe(() => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date;
  });
}
```

### Retry y Timeout

```typescript
// src/utils/async.ts

/**
 * Retry una función async con exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      await sleep(Math.min(delay, maxDelay));
      delay *= backoffFactor;
    }
  }
  
  throw lastError!;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Timeout para promesas
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}
```

### Formatters

```typescript
// src/utils/formatters.ts

/**
 * Formatea números como moneda
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Formatea fechas
 */
export function formatDate(
  date: Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format
  }).format(date);
}

/**
 * Formatea fechas para ISO string
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Capitaliza primera letra
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Genera slug desde string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Crypto y Hashing

```typescript
// src/utils/crypto.ts
import { randomBytes, createHash, randomUUID } from 'crypto';

/**
 * Genera un token random
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Genera UUID
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Hash de string con SHA-256
 */
export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Genera hash para password (usar con salt)
 */
export function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Compara password con hash
 */
export function verifyPassword(
  password: string,
  salt: string,
  hash: string
): boolean {
  return hashPassword(password, salt) === hash;
}
```

### Array y Object Utilities

```typescript
// src/utils/collections.ts

/**
 * Agrupa array por key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Remueve duplicados de array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remueve duplicados por key
 */
export function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Chunking de arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Omite keys de objeto
 */
export function omit<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Selecciona keys de objeto
 */
export function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
```

### Cache Simple

```typescript
// src/utils/cache.ts

interface CacheItem<T> {
  value: T;
  expiry: number;
}

/**
 * Cache en memoria simple
 */
export class SimpleCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  
  set(key: string, value: T, ttlMs = 300000): void { // 5 min default
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs
    });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Cache global para uso general
export const globalCache = new SimpleCache<any>();
```

### Type Guards

```typescript
// src/utils/types.ts

/**
 * Type guard para verificar si un valor existe
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard para strings
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard para números
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard para arrays
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard para objetos
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard para fechas válidas
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}
```

### Environment Helpers

```typescript
// src/utils/env.ts

/**
 * Verifica si estamos en desarrollo
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Verifica si estamos en producción
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Verifica si estamos en test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Obtiene variable de entorno con default
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}
```

## Export Pattern

En `src/utils/index.ts`:

```typescript
// Core utilities (ya existentes)
export { safe, safeAsync } from './catcher';

// Nuevas utilidades
export * from './validation';
export * from './async';
export * from './formatters';
export * from './crypto';
export * from './collections';
export * from './cache';
export * from './types';
export * from './env';
```

## Naming Conventions

1. **Archivos**: Usar nombres descriptivos
   - `validation.ts` - Utilidades de validación
   - `async.ts` - Utilidades asíncronas
   - `formatters.ts` - Formateo de datos

2. **Funciones**: Usar verbos descriptivos
   - `safeValidate()`
   - `formatCurrency()`
   - `generateToken()`

3. **Clases**: PascalCase
   - `SimpleCache`
   - `RateLimiter`

## Testing

```typescript
// tests/utils/validation.test.ts
import { safeValidate } from '@/utils';
import { z } from 'zod';

describe('safeValidate', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number()
  });
  
  it('should validate valid data', () => {
    const result = safeValidate(schema, { name: 'John', age: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe('John');
    }
  });
  
  it('should handle invalid data', () => {
    const result = safeValidate(schema, { name: 'John' });
    expect(result.ok).toBe(false);
  });
});
```
