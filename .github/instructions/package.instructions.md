---
applyTo: 'package.json'
---

# Instrucciones para Package.json

## Scripts de NPM

### Scripts de Desarrollo
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch ./src/index.ts",
    "dev:no-reload": "NODE_ENV=development tsx ./src/index.ts"
  }
}
```

- `npm run dev` - Desarrollo con hot-reload
- `npm run dev:no-reload` - Desarrollo sin hot-reload

### Scripts de Build
```json
{
  "scripts": {
    "clean": "rimraf ./dist ./src/client/client.ts ./src/docs/api.yaml",
    "build": "npm run clean && npm run lint && tsc && echo \"✅ Build ready in the /dist folder. Run it with npm run start\"",
    "start": "NODE_ENV=production node ."
  }
}
```

- `npm run clean` - Limpia archivos generados
- `npm run build` - Build completo para producción
- `npm run start` - Ejecuta build de producción

### Scripts de Calidad
```json
{
  "scripts": {
    "lint": "eslint --cache \"src/**/*.{js,ts}\"",
    "lint:fix": "eslint --cache --fix \"src/**/*.{js,ts}\"",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Scripts de Generación
```json
{
  "scripts": {
    "generate:client": "NODE_ENV=development tsx ./src/scripts/clientGenerator.ts",
    "generate:docs": "NODE_ENV=development tsx ./src/scripts/docsGenerator.ts"
  }
}
```

### Scripts de Docker
```json
{
  "scripts": {
    "docker:build": "docker build -t your-app:latest .",
    "docker:run": "docker run -e NODE_ENV=production your-app",
    "docker:build:dev": "docker build --target builder -t your-app:dev .",
    "docker:run:dev": "docker run -e NODE_ENV=development your-app:dev"
  }
}
```

## Configuración del Proyecto

### Información Básica
```json
{
  "name": "your-api-name",
  "version": "1.0.0",
  "description": "Your API description",
  "main": "dist/index.js",
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### Tipo de Módulo
```json
{
  "type": "module"
}
```
**IMPORTANTE**: Este proyecto usa ESM, no CommonJS.

### Module Aliases
```json
{
  "_moduleAliases": {
    "@": "dist"
  }
}
```

### Metadatos
```json
{
  "keywords": [
    "nodejs",
    "typescript",
    "express",
    "api",
    "zod",
    "rest"
  ],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://your-website.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-repo.git"
  },
  "license": "MIT"
}
```

## Dependencias

### Dependencias de Producción
```json
{
  "dependencies": {
    "@total-typescript/ts-reset": "^0.4.2",
    "compression": "^1.8.1",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "express-fileupload": "^1.5.2",
    "express-zod-api": "^25.3.1",
    "http-errors": "^2.0.0",
    "luxon": "^3.7.1",
    "module-alias": "^2.2.2",
    "multer": "^2.0.2",
    "node-fetch": "^3.3.2",
    "tsc-alias": "^1.8.16",
    "zod": "^4.0.0"
  }
}
```

### Dependencias de Desarrollo
```json
{
  "devDependencies": {
    "@tanstack/eslint-config": "^0.3.0",
    "@tsconfig/recommended": "^1.0.2",
    "@types/compression": "^1.8.1",
    "@types/express": "^5.0.3",
    "@types/luxon": "^3.6.2",
    "@types/module-alias": "^2.0.1",
    "@types/multer": "^2.0.0",
    "@types/node": "^20.14.8",
    "@types/node-fetch": "^2.6.12",
    "@typescript-eslint/eslint-plugin": "^8.38.0",
    "@typescript-eslint/parser": "^8.38.0",
    "eslint": "^9.34.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-prettier": "^4.2.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.4",
    "prettier": "^2.8.7",
    "rimraf": "^4.4.1",
    "ts-add-js-extension": "^1.6.6",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "tsx": "^4.19.2",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0"
  }
}
```

## Git Hooks

### Husky Configuration
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

### Lint-Staged
```json
{
  "lint-staged": {
    "*.{js,ts}": "npm run lint:fix"
  }
}
```

## Scripts Personalizados Recomendados

### Para Testing
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config jest.e2e.config.js"
  }
}
```

### Para Base de Datos (si usas ORM)
```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx src/scripts/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}
```

### Para Deployment
```json
{
  "scripts": {
    "deploy:staging": "npm run build && deploy-to-staging.sh",
    "deploy:production": "npm run build && deploy-to-production.sh",
    "heroku-postbuild": "npm run build"
  }
}
```

### Para Code Quality
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,js}\"",
    "format:check": "prettier --check \"src/**/*.{ts,js}\"",
    "audit": "npm audit",
    "audit:fix": "npm audit fix"
  }
}
```

## Dependencias Adicionales Comunes

### Para Testing
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.12",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0"
  }
}
```

### Para Base de Datos
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0"
  }
}
```

### Para Autenticación
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/passport": "^1.0.12",
    "@types/passport-jwt": "^3.0.8"
  }
}
```

### Para Validación y Utilities
```json
{
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.195",
    "@types/uuid": "^9.0.2"
  }
}
```

## Configuración de Engines

### Para Node.js específico
```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Strict Engines
```json
{
  "engineStrict": true
}
```

## Configuración de Publicación

### Para NPM Registry
```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "package.json"
  ]
}
```

### Private Package
```json
{
  "private": true
}
```

## Ejemplo Completo

```json
{
  "name": "my-express-api",
  "version": "1.0.0",
  "description": "Express API with Zod validation",
  "main": "dist/index.js",
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "clean": "rimraf ./dist ./src/client/client.ts ./src/docs/api.yaml",
    "build": "npm run clean && npm run lint && tsc",
    "start": "NODE_ENV=production node .",
    "dev": "NODE_ENV=development tsx watch ./src/index.ts",
    "dev:no-reload": "NODE_ENV=development tsx ./src/index.ts",
    "lint": "eslint --cache \"src/**/*.{js,ts}\"",
    "lint:fix": "eslint --cache --fix \"src/**/*.{js,ts}\"",
    "generate:client": "NODE_ENV=development tsx ./src/scripts/clientGenerator.ts",
    "generate:docs": "NODE_ENV=development tsx ./src/scripts/docsGenerator.ts",
    "docker:build": "docker build -t my-api:latest .",
    "docker:run": "docker run -e NODE_ENV=production my-api"
  },
  "_moduleAliases": {
    "@": "dist"
  },
  "keywords": [
    "nodejs",
    "typescript",
    "express",
    "api",
    "zod"
  ],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "dependencies": {
    "express": "^5.1.0",
    "express-zod-api": "^25.3.1",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.8",
    "typescript": "^5.8.3",
    "tsx": "^4.19.2"
  }
}
```
