# RBAC con NestJS

## Creamos el proyecto y entramos en el directorio

```bash
nest new rbac-nestjs
cd rbac-nestjs
```

## Generamos el module y controller de user

```bash
nest g module user
nest g controller user
```

## Creamos el archivo src/auth/auth.middleware.ts

Este middleware simulará la autenticación de usuarios.

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		// Simulamos un usuario autenticado
		(req as any).user = {
			id: 1,
			role: 'admin',
			permissions: ['view_reports']
		};
		next();
	}
}
```

## En main.ts agregamos el middleware globalmente

Esto nos permite que el middleware se ejecute en todas las rutas

```ts
import { AuthMiddleware } from './auth/auth.middleware';

...

app.use(new AuthMiddleware().use);
await app.listen(3000);

```

## Creamos el archivo src/auth/roles.decorator.ts

Con este decorator definimos qué roles requiere cada endpoint. 
Esta información se guarda como metadata, para que luego un Guard la lea y valide el acceso.

Este decorator nos permite definir el rol encima de la ruta de la siguiente manera:

```ts
@Roles('admin')
```

```ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

## Creamos el Guard src/auth/roles.guard.ts

El Guard obtiene el rol definido en el decorator y verifica si el usuario tiene ese rol.
Si no tiene el rol, retorna false y no deja pasar.
Si cumple, retorna true y entra al endpoint

```ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!requiredRoles) return true;

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		return user && requiredRoles.includes(user.role);
	}
}
```

## Registramos el Guard globalmente en app.module.ts

Esto nos permite que el Guard se ejecute en todas las rutas,
ya no es necesario ponerlo en cada ruta individualmente `@UseGuards(RolesGuard)`

```ts
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';

@Module({
	...
  providers: [
		...
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
```

## Creamos el /src/user/user.controller.ts

Aqui vamos a definir nuestros endpoints, utilizando el decorator `@Roles` para definir los roles que requieren cada endpoint.
Como el Guard ya esta definido y se usa globalmente, no es necesario ponerlo por ruta

```ts
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class UserController {
  @Get('profile')
  getProfile(@Req() req: Request) {
    return { message: 'Perfil de usuario', user: (req as any).user };
  }

  @Get('admin/users')
  @Roles('admin')
  getAllUsers() {
    return { message: 'Usuarios solo para admin' };
  }

  @Get('reports')
  @Roles('admin', 'supervisor')
  getReports() {
    return { message: 'Reportes visibles para admin y supervisor' };
  }
}
```