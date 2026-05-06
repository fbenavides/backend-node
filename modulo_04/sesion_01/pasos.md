# Backend con Koa

## Estructura del proyecto

### Iniciamos proyecto e instalamos dependencias

```bash
pnpm init
pnpm add -P koa koa-router koa-bodyparser
pnpm add -D typescript tsx @types/koa @types/koa-router @types/node
```

### Creamos el tsconfig.json

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

### Agregamos scripts de desarrollo

```json
scripts: {
  "dev": "tsx watch src/main.ts"
}
```

### Estructura inspirada en NestJS

Usaremos una estructura similiar a la de NestJS

```
src/
├── main.ts
├── app.ts
├── routes/
│   └── v1/
│       └── user.routes.ts
├── controllers/
│   └── v1/
│       └── user.controller.ts
├── services/
│   └── user.service.ts
├── middlewares/
│   └── error.middleware.ts
├── utils/
│   └── response.ts
├── entities/
│   └── user.entity.ts
```

---

### Creamos la carpeta `src` y entramos en ella


### Creamos el archivo `main.ts`

El archivo principal, donde creamos la aplicación
Ideal empezar el proyecto con el archivo `.env` usando `dotenv` 
para cargar variables de entorno
En este caso el `PORT` debería estar en el `.env`

```ts
import { app } from './app'

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`)
})
```

### Creamos el archivo `app.ts`

En este archivo definimos la aplicación, los middlewares globales que utilizará, los archivos de rutas, etc.

```ts
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import userRoutes from './routes/v1/user.routes'
import { errorMiddleware } from './middlewares/error.middleware'

const app = new Koa()

app.use(errorMiddleware)
app.use(bodyParser())
app.use(userRoutes.routes()).use(userRoutes.allowedMethods())

export { app }
```

### Creamos el archivo `routes/v1/user.routes.ts`

En este archivo definimos todos los endpoints públicos de la API

```ts
import Router from 'koa-router'
import { getUsers, createUser } from '../../controllers/v1/user.controller'

const router = new Router({ prefix: '/api/v1/users' })

router.get('/', getUsers)
router.post('/', createUser)

export default router
```

### Creamos el archivo `controllers/v1/user.controller.ts`

En este archivo definimos las funciones públicas de la API

```ts
import { Context } from 'koa'
import { UserService } from '../../services/user.service'
import { successResponse } from '../../utils/response'

export const getUsers = async (ctx: Context) => {
	const users = await UserService.getAll()
	ctx.body = successResponse(users)
}

export const createUser = async (ctx: Context) => {
	const user = await UserService.create(ctx.request.body)
	ctx.status = 201
	ctx.body = successResponse(user, 'Usuario creado correctamente')
}
```

### Creamos el archivo `services/user.service.ts`

Aquí definimos las funciones privadas, es donde va la lógica de negocio de nuestra API

```ts
export const UserService = {
	async getAll() {
		return [{ id: 1, name: 'Alice' }]
	},
	async create(data: any) {
		return { id: Date.now(), ...data }
	}
}
```

### Creamos el archivo `middlewares/error.middleware.ts`

Este middleware maneja todas las excepciones que puedan ocurrir en nuestra API

```ts
import { Context, Next } from 'koa'

export const errorMiddleware = async (ctx: Context, next: Next) => {
	try {
		await next()
	} catch (err: any) {
		ctx.status = err.status || 500
		ctx.body = {
			status: 'error',
			message: err.message || 'Internal Server Error'
		}
	}
}
```

### Creamos el archivo `utils/response.ts`

Aquí definimos las funciones que nos ayudan a crear estandarizadas HTTP

```ts
export const successResponse = (data: any, message = 'Success') => ({
	status: 'success',
	message,
	data
})
```

## Typeorm

### Levantamos una base de datos usando Docker

```bash
docker compose up -d
```

### Instalamos las dependencias necesarias

```bash
pnpm add typeorm mysql2 reflect-metadata dotenv
```

### Actualizamos el archivo `tsconfig.json`

```json
{
  "compilerOptions": {
    ...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Creamos el archivo `utils/database.ts`

Este archivo define la conexión a la base de datos

```ts
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'

export const AppDataSource = new DataSource({
	type: 'mysql',
	host: 'localhost',
	port: 3306,
	username: 'root',
	password: 'root',
	database: 'koa_example',
	entities: [User],
	synchronize: true, // solo para desarrollo
})
```

### Creamos el archivo `src/entities/user.entity.ts`

Este archivo es igual al de NestJS, ya que trabaja con TypeORM

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id!: number

	@Column({ type: 'varchar', length: 100 })
	name!: string

	@Column({ type: 'varchar', length: 150 })
	email!: string
}
```

### Modificamos el archivo `src/main.ts`

Inicializamos la conexión a la base de datos

```ts
import { app } from './app'
import { AppDataSource } from './utils/database'

const PORT = 3000

AppDataSource.initialize()
	.then(() => {
		console.log('Database connected')

		app.listen(PORT, () => {
			console.log(`Server ready at http://localhost:${PORT}`)
		})
	})
	.catch((error) => {
		console.error('Error connecting to database', error)
	})
```

### Creamos el archivo `src/repositories/user.repository.ts`

```ts
import { AppDataSource } from '../utils/database'
import { User } from '../entities/user.entity'

const repo = () => AppDataSource.getRepository(User)

export const UserRepository = {
	findAll() {
		return repo().find()
	},

	findById(id: number) {
		return repo().findOne({
			where: { id }
		})
	},

	findByEmail(email: string) {
		return repo().findOne({
			where: { email }
		})
	},

	create(data: { name: string; email: string }) {
		const user = repo().create(data)
		return repo().save(user)
	}
}
```

### Modificamos el archivo `src/services/user.service.ts`

```ts
import { UserRepository } from '../repositories/user.repository'

export const UserService = {
	async getAll() {
		return UserRepository.findAll()
	},

	async create(data: { name: string; email: string }) {
		const existingUser = await UserRepository.findByEmail(data.email)

		if (existingUser) {
			throw new Error('El email ya está registrado')
		}

		return UserRepository.create(data)
	}
}
```

## DTOs o Schemas

Creamos las validaciones cuando ingresan datos a nuestros endpoints

### Instalamos las dependencias

```bash
pnpm add zod
```

### Creamos el archivo `src/schemas/user.schema.ts`

```ts
import { z } from 'zod'

export const createUserSchema = z.object({
	name: z.string().min(2, 'El nombre debe tener mínimo 2 caracteres'),
	email: z.string().email('Email inválido')
})

export type CreateUserDTO = z.infer<typeof createUserSchema>
```

### Creamos el archivo `src/middlewares/validate.middleware.ts`

Este middleware usara zod para validarQue los datos que recibimos del cliente
tienen la estructura definida en el schema

```ts
import { Context, Next } from 'koa'
import { ZodSchema } from 'zod'

export const validateBody = (schema: ZodSchema) => {
	return async (ctx: Context, next: Next) => {
		const result = schema.safeParse(ctx.request.body)

		if (!result.success) {
			ctx.status = 400
			ctx.body = {
				status: 'error',
				message: 'Validation error',
				errors: result.error.issues.map((issue) => ({
					field: issue.path.join('.'),
					message: issue.message
				}))
			}
			return
		}

		ctx.request.body = result.data
		await next()
	}
}
```

### Modificamos el archivo /src/routes/v1/user.routes.ts

```ts
..
import { validateBody } from '../../middlewares/validate.middleware'
import { createUserSchema } from '../../schemas/user.schema'

...
router.post('/', validateBody(createUserSchema), createUser)

...

```

### Modificamos el archivo /src/controllers/user.controller.ts

Lo modificamos para tipar el body que llegaConEl Schema que hemos definido

```ts
...
import { CreateUserDTO } from '../../schemas/user.schema'

export const createUser = async (ctx: Context) => {

  const user = await UserService.create(ctx.request.body as CreateUserDTO)
  ...
}
```


## Versionamiento de APIs

Se utiliza para no romper funcionalidades en producción, en clientes antiguos o que aún no están actualizados.

### Creamos el archivo `src/routes/v2/user.routes.ts`

```ts
import Router from 'koa-router'
import { getUsers } from '../../controllers/v2/user.controller'

const router = new Router({ prefix: '/api/v2/users' })

router.get('/', getUsers)

export default router
```

### Modificamos el archivo `src/app.ts`

```ts
import userRoutesV1 from './routes/v1/user.routes'
import userRoutesV2 from './routes/v2/user.routes'

app.use(userRoutesV1.routes()).use(userRoutesV1.allowedMethods())
app.use(userRoutesV2.routes()).use(userRoutesV2.allowedMethods())
```

### Creamos el archivo `src/controllers/v2/user.controller.ts`

```ts
import { Context } from 'koa'
import { UserService } from '../../services/user.service'
import { successResponse } from '../../utils/response'

export const getUsers = async (ctx: Context) => {
  const users = await UserService.getAll()

  const usersResponse = users.map(user => ({
    name: user.name,
    email: user.email
  }))

  ctx.body = successResponse(usersResponse)
}
```

### Creamos el archivo `src/middlewares/version-tracker.middleware.ts`

Usamos un middleware para capturar el uso de la V1, cuando vemos que ya no se está usando,
podemos retirarlo de nuestra API.
Aqui simplemente lo mostramos en consola, pero lo ideal es guardarlo en un archivo log con Winston o en BD para luego analizarlo.

```ts
import { Context, Next } from 'koa'

export const trackV1Usage = async (ctx: Context, next: Next) => {

	const start = Date.now()
	await next()
	const duration = Date.now() - start
	console.log(
		`[V1 USAGE] ${ctx.method} ${ctx.url} - ${ctx.status} - ${duration}ms`
	)
}
```

### Modificamos el archivo `src/routes/v1/user.routes.ts`

Podemos agregar nuestro middleware en cada router que queremos trackear su uso

```ts
...
import { trackV1Usage } from '../../middlewares/version-tracker.middleware'

...
router.get('/', trackV1Usage, getUsers)

```
