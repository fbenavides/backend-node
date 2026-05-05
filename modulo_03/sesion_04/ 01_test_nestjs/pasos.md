# Manejo de errores con NestJS

## Configuración

### Creamos el proyecto y entramos en el directorio

```bash
nest new pruebas-unitarias-nestjs
cd pruebas-unitarias-nestjs
```

### Instalamos dependecias

NestJS ya nos incluye las librerias `jest`, `ts-jest` y `@types/jest`

```bash
pnpm add -P class-validator class-transformer
```

### Creamos el archivo `jest.config.ts`

```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
};
```

### Eliminamos el atributo `jest` del `package.json`

Lo eliminamos para poder usar la configuración de `jest.config.ts`

### Corremos `pnpm test` para probar que todo funciona

Veremos el test Hello World

## Test DTOs

### Creamos el archivo `src/users/dto/create-user.dto.ts`

Creamos el archivo para validar los datos enviados por el cliente al crear un usuario (Registro)

```ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

```

### Creamos el test del DTO

Creamo el archivo `src/users/dto/create-user.dto.spec.ts`


```ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('debería pasar si los datos son válidos', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Fernando',
      email: 'fernando@edex.pe',
      password: '123456',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
```

Al correr `pnpm test` debería pasar todo ok.

Ahora vamos a crear casos de error para los DTOs

```ts
  it('debería fallar si el email no es válido', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Fernando',
      email: 'correo-malo',
      password: '123456',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
```

```ts
  it('debería fallar si el password tiene menos de 6 caracteres', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
```

## Test DAO/Repository

### Creamos el DAO/Repository de User

Creamos el archivo `src/users/dao/user.dao.ts`

```ts
export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export class UserDao {
  private users: User[] = [];
  private nextId = 1;

  async findOneByEmail(email: string): Promise<User | null> {
    const user = this.users.find((user) => user.email === email);
    return user ?? null;
  }

  async save(data: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...data,
    };

    this.users.push(user);

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}
```

### Creamos el test del DAO/Repository

Creamos el archivo `src/users/dao/user.dao.spec.ts`

```ts
import { UserDao } from './user.dao';

describe('UserDao', () => {
  let repository: UserDao;

  beforeEach(() => {
    repository = new UserDao();
  });

  it('debería guardar un usuario', async () => {
    const user = await repository.save({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    expect(user).toEqual({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });
  });

  it('debería buscar un usuario por email', async () => {
    await repository.save({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    const user = await repository.findOneByEmail('fernando@test.com');

    expect(user).toEqual({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });
  });

  it('debería retornar null si no encuentra el email', async () => {
    const user = await repository.findOneByEmail('noexiste@test.com');

    expect(user).toBeNull();
  });

  it('debería listar todos los usuarios', async () => {
    await repository.save({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    await repository.save({
      name: 'Carlos',
      email: 'carlos@test.com',
      password: '123456',
    });

    const users = await repository.findAll();

    expect(users).toHaveLength(2);
  });
});
```

## Test Service

### Creamos el Service de User

Creamos el archivo `src/users/service/user.service.ts`

```ts
import { UserDao, User } from '../dao/user.dao';

type CreateUserInput = Omit<User, 'id'>;

export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async create(data: CreateUserInput): Promise<User> {
    const existingUser = await this.userDao.findOneByEmail(data.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    return this.userDao.save(data);
  }

  async findAll(): Promise<User[]> {
    return this.userDao.findAll();
  }
}
```

### Creamos el test del Service

Creamos el archivo `src/users/service/user.service.spec.ts`

```ts
import { UserService } from './user.service';
import { UserDao } from './user.dao';

describe('UserService', () => {
  let service: UserService;
  let mockUserDao: jest.Mocked<UserDao>;

  beforeEach(() => {
    mockUserDao = {
      findOneByEmail: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserDao>;

    service = new UserService(mockUserDao);
  });

  it('debería crear un usuario si el email no existe', async () => {
    mockUserDao.findOneByEmail.mockResolvedValue(null);

    mockUserDao.save.mockResolvedValue({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    const result = await service.create({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    expect(result).toEqual({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    expect(mockUserDao.findOneByEmail).toHaveBeenCalledWith('fernando@test.com');
    expect(mockUserDao.save).toHaveBeenCalledWith({
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });
  });

  it('debería lanzar error si el email ya existe', async () => {
    mockUserDao.findOneByEmail.mockResolvedValue({
      id: 1,
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    });

    await expect(
      service.create({
        name: 'Otro Fernando',
        email: 'fernando@test.com',
        password: 'abcdef',
      }),
    ).rejects.toThrow('Email already exists');

    expect(mockUserDao.save).not.toHaveBeenCalled();
  });

  it('debería listar todos los usuarios', async () => {
    mockUserDao.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(mockUserDao.findAll).toHaveBeenCalled();
  });
});
```

## Test Controller

### Creamos el Controller de User

Creamos el archivo `src/users/controller/user.controller.ts`

```ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../dao/user.dao';

type CreateUserDto = Omit<User, 'id'>;

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
```

### Creamos el test del Controller

Creamos el archivo `src/users/controller/user.controller.spec.ts`

```ts
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = {
      create: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(mockUserService);
  });

  it('debería crear un usuario', async () => {
    const body = {
      name: 'Fernando',
      email: 'fernando@test.com',
      password: '123456',
    };

    const createdUser = {
      id: 1,
      ...body,
    };

    mockUserService.create.mockResolvedValue(createdUser);

    const result = await controller.create(body);

    expect(result).toEqual(createdUser);
    expect(mockUserService.create).toHaveBeenCalledWith(body);
  });

  it('debería listar todos los usuarios', async () => {
    const users = [
      {
        id: 1,
        name: 'Fernando',
        email: 'fernando@test.com',
        password: '123456',
      },
    ];

    mockUserService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(result).toEqual(users);
    expect(mockUserService.findAll).toHaveBeenCalled();
  });
});
```

## Jest html reporter

Para ver los resultados de cada test podemos usar `pnpm test --verbose` y ver detallado cada test ejecutado.

Pero también podemos usar el reporter `jest-html-reporter` para ver los resultados de los test en formato html

```bash
pnpm add -D jest-html-reporter
```

Agregamos al `jest.config.ts` la configuración del reporter

```ts
...
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
...
```

Corremos `pnpm test` y nos creará el archivo `test-report.html` con los resultados de los test

## Coverage

Corremos `pnpm test --coverage` y nos creará el archivo `coverage/lcov-report/index.html` con el resultado de la cobertura

Nos ayuda a saber que % de nuestro código se ha probado.

## CI/CD con GitHub Actions

Creamos el archivo `.github/workflows/run-tests.yml`
con el siguiente contenido:

```yml
name: Run Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Descargar código
        uses: actions/checkout@v4

      - name: Instalar pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Instalar Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Instalar dependencias
        run: pnpm install --frozen-lockfile

      - name: Ejecutar tests
        run: pnpm test

      - name: Ejecutar coverage
        run: pnpm test --coverage

      - name: Subir coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

Hacer commit y push y luego ir a la pestaña actions de github para ver los resultados de los tests