# RBAC con Fastify

## Creamos la carpeta `rbac-fastify` y entramos en ella

```bash
mkdir rbac-fastify && cd rbac-fastify
```

## Iniciamos proyecto e instalamos dependencias

```bash
pnpm init
pnpm add fastify fastify-plugin
pnpm add -D typescript tsx @types/node
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

## Agregamos scripts y type a package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts"
  }
}
```

## Creamos el archivo src/server.ts

```ts
import { buildApp } from './app.js';

const app = await buildApp();

try {
  await app.listen({ port: 3000 });
  console.log('Fastify server http://localhost:3000');
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
```

## Creamos el archivo `app.ts`

```ts
import Fastify from 'fastify';
import { authPlugin } from './plugins/auth.plugin.js';
import { routes } from './routes/index.js';

export async function buildApp() {
  
  const app = Fastify({
    logger: true,
  });

  await app.register(authPlugin);
  await app.register(routes);
  return app;
}
```

## Creamos el archivo src/plugins/auth.plugin.ts

En Fastify, en lugar de un enfoque orientado a middlewares, se trabaja con hooks.
Que se van ejecutando antes de cada acción del ciclo de vida del request

Ciclo de vida del request:
onRequest
-> preParsing
-> preValidation
-> preHandler
-> handler
-> preSerialization
-> onSend
-> onResponse
(onError puede ocurrir en cualquier punto)

```ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const authPluginBase: FastifyPluginAsync = async (app) => {
  app.decorateRequest('user', null);

  app.addHook('preHandler', async (request) => {
    console.log('preHandler');

    request.user = {
      id: 1,
      role: 'admin',
      permissions: ['view_reports'],
    };
  });
};

export const authPlugin = fp(authPluginBase);
```

## Creamos el archivo /src/hooks/authorize.ts

Esta es nuestra función que valida si el usuario tiene el rol definido en la ruta


```ts
import { FastifyReply, FastifyRequest } from 'fastify';

export function authorize(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user || !roles.includes(user.role)) {
      return reply.code(403).send({
        message: 'Access denied',
      });
    }
  };
}
```

## Creamos el archivo src/routes/index.ts

```ts
import { FastifyPluginAsync } from 'fastify';
import { userRoutes } from './user.routes.js';

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(userRoutes);
};
```

## Creamos el archivo /src/routes/user.routes.ts

```ts
import { FastifyPluginAsync } from 'fastify';
import { authorize } from '../hooks/authorize.js';

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/profile', async (request) => {
    return {
      message: 'Perfil público',
      user: request.user,
    };
  });

  app.get('/admin/users', {
    preHandler: authorize(['admin']),
    handler: async () => {
      return { message: 'Solo para admins' };
    },
  });

  app.get('/reports', {
    preHandler: authorize(['admin', 'supervisor']),
    handler: async () => {
      return { message: 'Vista de reportes' };
    },
  });
};
```

## Creamos el archivo /src/types/fastify.d.ts

Fastify es más estricto con el tipado que Koa
Aqui le decimos que FastifyRequest también va a tener un atributo `user`

```ts
import 'fastify';

type UserRole = 'admin' | 'supervisor' | 'user';

interface AuthUser {
  id: number;
  role: UserRole;
  permissions: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null;
  }
}
```