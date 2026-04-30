# Manejo de errores con NestJS

## Creamos el proyecto y entramos en el directorio

```bash
nest new manejo-errores-nestjs
cd manejo-errores-nestjs
```

## Instalamos dependecias

```bash
pnpm add -P nestjs-pino pino-http pino
pnpm add -D pino-pretty
```

## Configuramos el logger global

En main.ts configuramos Pino como logger global de NestJS y registramos un filtro global para capturar todos los errores no controlados.

```ts
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

...

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  await app.listen(3001);
}
bootstrap();
```

## Creamos el filtro de excepciones usado en main.ts

Creamos el archivo /common/filters/all-exceptions.filter.ts

Aquí es donde se capturaran los errores, cada vez que se realice un throw error, lo formateará, enviará al logger y responderá al usuario con el error.

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException ? exception.getResponse() : exception;

    const traceId = request.headers['x-trace-id'] || 'N/A';

    this.logger.error(
      {
        message: 'Error capturado por AllExceptionsFilter',
        traceId,
        path: request.url,
        method: request.method,
        error: exception,
      },
      'Exception',
    );

    response.status(status).json({
      statusCode: status,
      message,
      traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
```
## Registramos pino en el app.module

```ts
import { LoggerModule } from 'nestjs-pino';

...

  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
  ],

```

## Creamos nuestra clase personalizada de error

Creamos el archivo /common/exceptions/http-custom.exception.ts

```ts
import { HttpException } from '@nestjs/common';

export class HttpCustomException extends HttpException {
  constructor(
    statusCode: number,
    message: string,
    public readonly context?: any,
  ) {
    super(
      {
        message,
        context,
      },
      statusCode,
    );
  }
}
```

## Ahora agregamos unas rutas para probar los errores y como lo captura el logger.

En el archivo /app.controller.ts agregamos distintos endpoints

```ts
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { HttpCustomException } from './common/exceptions/http-custom.exception';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Get('error')
  simulateError(@Req() request: Request) {
    const traceId = request.headers['x-trace-id'] || 'N/A';

    this.logger.warn({
      message: 'Se va a lanzar una excepción',
      traceId,
    });

    throw new HttpCustomException(
      400,
      'Este es un error de prueba',
      { module: 'AppController', requestId: traceId },
    );
  }

  @Get('error1')
  simulateError1(@Req() request: Request) {
    const traceId = request.headers['x-trace-id'] || 'N/A';

    const quantity = 4;
    const stock = 2;

    if (quantity > stock) {
      throw new HttpCustomException(
        409,
        'No hay stock suficiente',
        { module: 'sales.create', requestId: traceId },
      );
    }

    // Registrar venta
    
  }

  @Get('error2')
  simulateError2(@Req() request: Request) {
    const traceId = request.headers['x-trace-id'] || 'N/A';

    const isLogged = false;

    if (!isLogged) {
      throw new HttpCustomException(
        401, 
        'No estás autenticado', 
        { module: 'sales.create', requestId: traceId },
      );
    }

    // Registrar venta
  }

  @Get('error3')
  simulateError3(@Req() request: Request) {
    const traceId = request.headers['x-trace-id'] || 'N/A';

    const isAdmin = false;

    if (!isAdmin) {
      throw new HttpCustomException(
        403,
        'No tienes permisos para registrar una venta',
        { module: 'sales.create', requestId: traceId },
      );
    }

    // Registrar venta
  }

  @Get('ok')
  ok(@Req() request: Request) {
    const traceId = request.headers['x-trace-id'] || 'N/A';

    this.logger.log({
      message: 'Petición exitosa',
      traceId,
    });

    return {
      message: 'Todo bien',
      traceId,
    };
  }
}
```
