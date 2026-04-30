# Manejo de errores con NestJS

## Iniciamos el proyecto

```bash
pnpm init
```

## Instalamos dependecias

```bash
pnpm add -P express pino pino-http
pnpm add -D typescript tsx @types/express @types/node pino-pretty
```

## Agregamos nuestros scripts en package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "start": "tsx src/main.ts"
  },
}
```

## Creamos el logger

Creamos el archivo `/src/common/logger.ts`

```ts
import pino from 'pino';

export const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
```

## Creamos nuestra función para errores personalizados

Creamos el archivo `/src/common/errors/app-error.ts`
Esto reemplaza a la clase HttpCustomException que creamos en NestJS

```ts
export type AppError = Error & {
  statusCode?: number;
  code?: string;
  context?: unknown;
};

export function createAppError(
  statusCode: number,
  message: string,
  code: string,
  context?: unknown,
): AppError {
  const error = new Error(message) as AppError;

  error.statusCode = statusCode;
  error.code = code;
  error.context = context;

  return error;
}
```

## Creamos un middleware para formatear el trace ID

Creamos el archivo `/src/common/middlewares/trace-id.middleware.ts`
Si el cliente no envía el trace ID, lo generamos y lo agregamos a la cabecera

```ts
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function traceIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const traceId = req.headers['x-trace-id']?.toString() || crypto.randomUUID();

  req.traceId = traceId;

  res.setHeader('x-trace-id', traceId);

  next();
}
```

## Creamos express types 

Este archivo es para que Typescript reconozca el atributo traceId que estamos definiendo en el middleware anterior
Creamos el archivo /src/types/express.d.ts

```ts
declare namespace Express {
  export interface Request {
    traceId?: string;
  }
}
```

## Creamos el middleware global para capturar todos los errores

Creamos el archivo /src/common/middlewares/error.middleware.ts
Este archivo reemplaza al filter que creamos en NestJS

```ts
import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../errors/app-error';

export function errorMiddleware(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = error.statusCode || 500;

  const code = error.code || 'INTERNAL_SERVER_ERROR';

  const message =
    statusCode === 500 ? 'Error interno del servidor' : error.message;

  req.log.error(
    {
      traceId: req.traceId,
      path: req.originalUrl,
      method: req.method,
      code,
      context: error.context,
      err: error,
    },
    'Error capturado por errorMiddleware',
  );

  return res.status(statusCode).json({
    statusCode,
    code,
    message,
    traceId: req.traceId,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
```

## Creamos el app controller

Creamos el archivo /src/app.controller.ts

```ts
import type { Request, Response, NextFunction } from 'express';
import { createAppError } from './common/errors/app-error';

export function ok(req: Request, res: Response) {
  req.log.info(
    {
      traceId: req.traceId,
    },
    'Petición exitosa',
  );

  return res.json({
    message: 'Todo bien',
    traceId: req.traceId,
  });
}

export function simulateError(req: Request, res: Response, next: NextFunction) {
  req.log.warn(
    {
      traceId: req.traceId,
    },
    'Se va a lanzar una excepción',
  );

  next(
    createAppError(
      400,
      'Este es un error de prueba',
      'TEST_ERROR',
      { module: 'AppController', requestId: req.traceId },
    ),
  );
}

export function insufficientStock(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const quantity = 4;
  const stock = 2;

  if (quantity > stock) {
    return next(
      createAppError(
        409,
        'No hay stock suficiente',
        'INSUFFICIENT_STOCK',
        { module: 'sales.create', requestId: req.traceId },
      ),
    );
  }

  return res.json({
    message: 'Venta registrada correctamente',
    traceId: req.traceId,
  });
}

export function unauthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const isLogged = false;

  if (!isLogged) {
    return next(
      createAppError(
        401,
        'No estás autenticado',
        'UNAUTHORIZED',
        { module: 'sales.create', requestId: req.traceId },
      ),
    );
  }

  return res.json({
    message: 'Venta registrada correctamente',
    traceId: req.traceId,
  });
}

export function forbidden(req: Request, res: Response, next: NextFunction) {
  const isAdmin = false;

  if (!isAdmin) {
    return next(
      createAppError(
        403,
        'No tienes permisos para registrar una venta',
        'FORBIDDEN',
        { module: 'sales.create', requestId: req.traceId },
      ),
    );
  }

  return res.json({
    message: 'Venta registrada correctamente',
    traceId: req.traceId,
  });
}
```

## Creamos el archivo de rutas para llamar al controller

Creamos el archivo /src/app.routes.ts

```ts
import { Router } from 'express';
import {
  ok,
  simulateError,
  insufficientStock,
  unauthenticated,
  forbidden,
} from './app.controller';

export const appRouter = Router();

appRouter.get('/ok', ok);
appRouter.get('/error', simulateError);
appRouter.get('/error1', insufficientStock);
appRouter.get('/error2', unauthenticated);
appRouter.get('/error3', forbidden);
```

## Creamos la aplicación principal, donde empieza todo

Creamos el archivo /src/main.ts

```ts
import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './common/logger';
import { traceIdMiddleware } from './common/middlewares/trace-id.middleware';
import { errorMiddleware } from './common/middlewares/error.middleware';
import { appRouter } from './app.routes';

const app = express();

app.use(express.json());

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(traceIdMiddleware);
app.use(appRouter);
app.use(errorMiddleware);

app.listen(3001, () => {
  logger.info('Servidor escuchando en http://localhost:3001');
});
```
