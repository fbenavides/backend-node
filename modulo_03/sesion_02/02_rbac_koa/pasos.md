# RBAC con Koa

## Creamos la carpeta `rbac-koa` y entramos en ella

```bash
mkdir rbac-koa && cd rbac-koa
```

## Iniciamos proyecto e instalamos dependencias

```bash
pnpm init
pnpm add -P koa koa-router koa-bodyparser
pnpm add -D typescript nodemon tsx @types/koa @types/koa-router @types/node
```

## Creamos el tsconfig.json

```bash
npx tsc --init
```

Pegamos este contenido en el tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Creamos el archivo `src/middleware/auth.ts`

En este middleware simulamos un usuario logueado

```ts
import { Context, Next } from 'koa';

export async function authMiddleware(ctx: Context, next: Next) {
  ctx.state.user = {
    id: 1,
    role: 'admin',
    permissions: ['view_reports'],
  };

  await next();
}
```

## Creamos el archivo `src/middleware/authorize.ts`

Este middleware verifica si el usuario tiene el rol definido en la ruta

```ts
import { Middleware } from 'koa';

export const authorize = (roles: string[]): Middleware => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (!user || !roles.includes(user.role)) {
      ctx.status = 403;
      ctx.body = { message: 'Access denied' };
      return;
    }
    await next();
  };
};
```

## Creamos el archivo /src/routes/user.routes.ts

En este archivo se definen las rutas/endpoints de la entidad.
Es el una parte de los controllers de NestJS

```ts
import Router from 'koa-router';
import { authorize } from '../middleware/authorize';

const router = new Router();

router.get('/profile', (ctx) => {
  ctx.body = {
    message: 'Perfil público',
    user: ctx.state.user,
  };
});

router.get('/admin/users', authorize(['admin']), (ctx) => {
  ctx.body = { message: 'Solo para admins' };
});

router.get('/reports', authorize(['admin', 'supervisor']), (ctx) => {
  ctx.body = { message: 'Vista de reportes' };
});

export default router;
```

## Creamos el archivo `src/routes/index.ts`

```ts
import Router from 'koa-router';
import userRoutes from './user.routes';

const router = new Router();

router.use(userRoutes.routes());

export default router;
```

## Creamos el archivo `app.ts`

Aqui definimos los middlewares globales de la aplicación
y el router

```ts
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './routes';
import { authMiddleware } from './middleware/auth';

export function createApp() {
  const app = new Koa();

  app.use(bodyParser());
  app.use(authMiddleware);
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
```

## Creamos el archivo `src/server.ts`

Este archivo solo crea y levanta la aplicación, es equivalente al main.ts de NestJS

```ts
import { createApp } from './app';

const app = createApp();

app.listen(3000, () => {
  console.log('Koa server http://localhost:3000');
});
```

## Agregamos el script `dev` en package.json

```json
  "dev": "npx nodemon --watch src --ext ts --exec \"tsx src/server.ts\""
```






