
# Logger

## En la terminal entrar a la carpeta 03_logger

```
cd ..
cd 03_logger
```

## Copiar los archivos trabajados en el ejemplo 01 anterior

- src
- package.json
- tsconfig.json
- nodemon.json

## Instalar dependencias

```
pnpm install
```

## Instalar debug

```
pnpm add -D debug
```

## Agregar código para debug

```ts
import debug from 'debug';

...

const log = debug('app:inicio');
const dbLog = debug('app:db');
const warnLog = debug('app:warning');

...

log('Hola');
dbLog('Entro a db');
```

## Agregar dotenv para cargar la variable DEBUG desde tu archivo .env

Instalar dotenv

```
pnpm add dotenv
```

Agregar al código

```
import dotenv from 'dotenv';

dotenv.config();

...

debug.enable(process.env.DEBUG || '');
```

Crear el archivo .env

```
DEBUG=app:*
```

---

## Instalar winston

```
pnpm add winston
```

## Agregar al código

```ts
import winston from 'winston';

...

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
  ],
});
```

## Agregar formatter

```ts
format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
),
```

## Agregar archivo de log

```ts
new winston.transports.File({ filename: 'app.log' }),
```


## Agregar distintos archivos de logs

```ts
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${extra}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
});
```

---

## Cambiar ts-node por tsx

```
pnpm add -D tsx
```

## Cambiar comando dev

```json
 "scripts": {
    "dev": "npx nodemon --watch src --ext ts --exec \"tsx src/main.ts\""
  },
```

---

## Instalación y configuración de ESLint y Prettier

### Instalar extensiones

- ESLint
- Prettier - Code formatter

### Instalar dependencias

```
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-prettier

pnpm add -D --save-exact prettier
```

### Crear archivo de configuración de ESLint

Crear archivo `eslint.config.mjs`

Agregar al archivo:

```ts
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  eslintConfigPrettier,

  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
```

## Crear archivo de configuración de Prettier

Crear archivo `.prettierrc`

Agregar al archivo:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

Crear archivo `.prettierignore`

Agregar al archivo:

```
dist
node_modules
```

## Agregar scripts de ejecución en package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

## Crear archivo de configuración de VSCode para que actualice al guardar el archivo

Crear archivo `.vscode/settings.json`

Agregar al archivo:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript"]
}
```
