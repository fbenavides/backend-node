# Swagger con NestJS

## Configuración

### Creamos el proyecto y entramos en el directorio

```bash
nest new swagger-nestjs && cd swagger-nestjs
```

### Instalamos dependecias

Vamos a crear un ejemplo de un Backend de una librería, un CRUD de libros.

```bash
pnpm add @nestjs/swagger swagger-ui-express class-validator class-transformer
```

### Modificamos el archivo `main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Books API (NestJS)')
    .setDescription('CRUD with mock data and Swagger')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { 
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Books API Docs (NestJS)',
  });

  await app.listen(3000);
  console.log('NestJS: http://localhost:3000');
  console.log('Docs:   http://localhost:3000/docs');
}
bootstrap();
```

### Modificamos el archivo `app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';

@Module({
  imports: [BooksModule],
})
export class AppModule {}
```

### Creamos el archivo `src/common/guards/dummy-jwt.guard.ts`

Este guard simula un JWT para que el usuario pueda autenticarse
SoloSe necesitaria enviar 'testtoken' como token de autenticación

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DummyJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    const token = auth.substring('Bearer '.length).trim();
    if (token !== 'testtoken') throw new UnauthorizedException('Invalid token');
    return true;
  }
}
```

### Creamos los DTOs

Los DTOs son objetos que representan los datos que se enviarán y recibirán en la API.
Es importantes documentarlos cuando se trabaja con Swagger.

Creamos `src/books/dto/book.dto.ts`

```ts
import { ApiProperty } from '@nestjs/swagger';

export class BookDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Clean Architecture' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author: string;

  @ApiProperty({ example: 2017 })
  year: number;
}
```

Creamos `src/books/dto/create-book.dto.ts`

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Architecture' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @MinLength(2)
  author: string;

  @ApiProperty({ example: 2017 })
  @IsInt()
  @Min(0)
  year: number;
}
```

Creamos `src/books/dto/update-book.dto.ts`

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional({ example: 'Refactoring' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional({ example: 'Martin Fowler' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  author?: string;

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @IsInt()
  @Min(0)
  year?: number;
}
```

### Creamos el archivo `src/books/books.service.ts`

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { BookDto } from './dto/book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  private books: BookDto[] = [
    {
      id: '1',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      year: 2017,
    },
    {
      id: '2',
      title: 'Refactoring',
      author: 'Martin Fowler',
      year: 2018,
    },
  ];

  findPublic(): BookDto[] { return this.books; }
  findAdmin(): BookDto[] { return this.books; }

  findOne(id: string): BookDto {
    const found = this.books.find(b => b.id === id);
    if (!found) throw new NotFoundException('Book not found');
    return found;
  }

  create(dto: CreateBookDto): BookDto {
    const id = (this.books.length + 1).toString();
    const book: BookDto = { id, ...dto };
    this.books.push(book);
    return book;
  }

  update(id: string, dto: UpdateBookDto): BookDto {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx < 0) throw new NotFoundException('Book not found');
    this.books[idx] = { ...this.books[idx], ...dto };
    return this.books[idx];
  }

  remove(id: string): void {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx < 0) throw new NotFoundException('Book not found');
    this.books.splice(idx, 1);
  }
}

```

### Creamos el archivo `src/books/books.controller.ts`

```ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { BookDto } from './dto/book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DummyJwtGuard } from '../common/guards/dummy-jwt.guard';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'List public books' })
  @ApiResponse({ status: 200, type: [BookDto] })
  findPublic(): BookDto[] { return this.books.findPublic(); }

  @Get('admin')
  @UseGuards(DummyJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List private books (admin)' })
  @ApiResponse({ status: 200, type: [BookDto] })
  findAdmin(): BookDto[] { return this.books.findAdmin(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by id' })
  @ApiResponse({ status: 200, type: BookDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string): BookDto { return this.books.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create book' })
  @ApiResponse({ status: 201, type: BookDto })
  create(@Body() dto: CreateBookDto): BookDto { return this.books.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update book' })
  @ApiResponse({ status: 200, type: BookDto })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto): BookDto {
    return this.books.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book' })
  @ApiResponse({ status: 204, description: 'No Content' })
  remove(@Param('id') id: string): void { this.books.remove(id); }
}

```

### Creamos el archivo `src/books/books.module.ts`

```ts
import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}

```