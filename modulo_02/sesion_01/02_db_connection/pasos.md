# Conexión a bases de datos

## En la terminal entrar a la carpeta 02_db_connection

```
cd ..
cd 02_db_connection
```

## Crear proyecto nest

```
nest new nest-direct-db
```

## Entrar a la carpeta del proyecto creada

```
cd nest-direct-db/
```

## Instalar dependencias para conectar con mysql y postgress

```
pnpm add mysql2
pnpm add pg
```

## Empezamos por la conexión a mysql

### Crear archivo de proveedor

Crear la carpeta `database`
Crear archivo `mysql.provider.ts`

### Agregar este código al archivo

```ts
import { createPool, Pool } from 'mysql2/promise';

export const mysqlProvider = {
  provide: 'MYSQL_POOL',
  useFactory: async (): Promise<Pool> => {
    const pool = createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'curso_backend',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    console.log('MySQL conectado');
    connection.release();

    return pool;
  },
};
```

### Crear el controller y service de mysql

Crear carpeta `user-mysql`

### Crear archivo `user-mysql.controller.ts`

```ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserMysqlService } from './user-mysql.service';

@Controller('users-mysql')
export class UserMysqlController {
  constructor(private readonly service: UserMysqlService) {}

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Get('find/:id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post('create')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put('update/:id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete('delete/:id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }

  // Ineguro con parámetros
  @Get('injection')
  async vulnerable(@Query('email') email: string) {
    return this.service.rawQueryUnsafe(email);
  }

  // Seguro con parámetros
  @Get('safe')
  async safe(@Query('email') email: string) {
    return this.service.rawQuerySafe(email);
  }
}

```

### Crear archivo `user-mysql.service.ts`

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

@Injectable()
export class UserMysqlService {
  constructor(@Inject('MYSQL_POOL') private pool: Pool) {}

  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM users');
    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ?', [
      id,
    ]);
    return Array.isArray(rows) ? rows[0] : null;
  }

  async create(data: { name: string; email: string }) {
    const [result] = await this.pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [data.name, data.email],
    );

    const insertResult = result as ResultSetHeader;

    return { id: insertResult.insertId, ...data };
  }

  async update(id: number, data: { name: string; email: string }) {
    await this.pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [
      data.name,
      data.email,
      id,
    ]);
    return { id, ...data };
  }

  async delete(id: number) {
    await this.pool.query('DELETE FROM users WHERE id = ?', [id]);
    return { deleted: true };
  }

  // Inseguro: construye la query como string
  async rawQueryUnsafe(condition: string) {
    const sql = `SELECT * FROM users WHERE ${condition}`;
    console.log('sql =', sql);
    const [rows] = await this.pool.query(sql);
    return rows;
  }

  // Seguro: usa parámetros
  async rawQuerySafe(email: string) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows;
  }
}
```

### Agregar el controller y el servicio a la aplicación

Modificar archivo `app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { UserMysqlController } from './user-mysql/user-mysql.controller';
import { mysqlProvider } from './database/mysql.provider';
import { UserMysqlService } from './user-mysql/user-mysql.service';

@Module({
  imports: [],
  controllers: [UserMysqlController],
  providers: [mysqlProvider, UserMysqlService],
})
export class AppModule {}
```



## Empezamos por la conexión a postgress

### Crear archivo de proveedor

Crear la carpeta `database`
Crear archivo `postgres.provider.ts`

### Agregar este código al archivo

```ts
import { Pool } from 'pg';

export const postgresProvider = {
  provide: 'POSTGRES_POOL',
  useFactory: async (): Promise<Pool> => {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'curso_backend',
      max: 10,
    });

    await pool.query('SELECT 1');
    console.log('PostgreSQL conectado');

    return pool;
  },
};
```

### Crear el controller y service de postgres

Crear carpeta `user-postgres`

### Crear archivo `user-postgres.controller.ts`

```ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UserPostgresService } from './user-postgres.service';

@Controller('users-postgres')
export class UserPostgresController {
  constructor(private readonly service: UserPostgresService) {}

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Get('find/:id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post('create')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put('update/:id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete('delete/:id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }

  // Ineguro con parámetros
  @Get('injection')
  async vulnerable(@Query('email') email: string) {
    return this.service.rawQueryUnsafe(email);
  }

  // Seguro con parámetros
  @Get('safe')
  async safe(@Query('email') email: string) {
    return this.service.rawQuerySafe(email);
  }
}
```

### Crear archivo `user-postgres.service.ts`

```ts
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UserPostgresService {
  constructor(@Inject('POSTGRES_POOL') private pool: Pool) {}

  async findAll() {
    const { rows } = await this.pool.query('SELECT * FROM users');
    return rows;
  }

  async findOne(id: number) {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return rows[0];
  }

  async create(data: { name: string; email: string }) {
    const result = await this.pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [data.name, data.email],
    );
    return result.rows[0];
  }

  async update(id: number, data: { name: string; email: string }) {
    await this.pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [data.name, data.email, id],
    );
    return { id, ...data };
  }

  async delete(id: number) {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
    return { deleted: true };
  }

  // Inseguro
  async rawQueryUnsafe(condition: string) {
    const sql = `SELECT * FROM users WHERE ${condition}`;
    console.log('sql =', sql);
    const result = await this.pool.query(sql);
    return result.rows;
  }

  // Seguro
  async rawQuerySafe(email: string) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return result.rows;
  }
}
```

### Agregar el controller y el servicio a la aplicación

Modificar archivo `app.module.ts`

```ts
import { UserPostgresController } from './user-postgres/user-postgres.controller';
import { postgresProvider } from './database/postgres.provider';
import { UserPostgresService } from './user-postgres/user-postgres.service';

....

  controllers: [UserMysqlController, UserPostgresController],
  providers: [
    mysqlProvider,
    UserMysqlService,
    postgresProvider,
    UserPostgresService,
  ],
```


## Agregar el config para usar .env

### Instalar ConfigModule

```
pnpm add @nestjs/config
```

### Crear archivo .env en la raiz del proyecto

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=curso_backend
MYSQL_CONNECTION_LIMIT=10
```

### Modificar archivo `app.module.ts`

```ts
import { ConfigModule } from '@nestjs/config';

...

imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
],

```

### Modificar archivo `mysql.provider.ts`

```ts
import { ConfigService } from '@nestjs/config';

...
useFactory: async (configService: ConfigService): Promise<Pool> => {

...

({
  host: configService.get<string>('MYSQL_HOST'),
  port: configService.get<number>('MYSQL_PORT'),
  user: configService.get<string>('MYSQL_USER'),
  password: configService.get<string>('MYSQL_PASSWORD'),
  database: configService.get<string>('MYSQL_DATABASE'),
  waitForConnections: true,
  connectionLimit: configService.get<number>('MYSQL_CONNECTION_LIMIT') || 10,
  queueLimit: 0,
});

...

inject: [ConfigService],
};