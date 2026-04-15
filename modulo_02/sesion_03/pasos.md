# Relaciones

## Crear relación 1:N Profile con User

### Crear la entity Profile

Solo crearemos la entidad, por ahora no le haremos controller ni service.

```ts
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 150, nullable: true })
  address?: string;

  @OneToOne(() => User, (user) => user.profile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;
}
```

### Registrar la relación también en User

```ts
  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;
```

### Registrarlo en app.module.ts

```ts
  entities: [User, Order, OrderItem, Product, Profile],
```

## Crear relación N:N Product con Category

### Crear la entity Category

```ts
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @ManyToMany(() => Product, (product) => product.categories)
  products!: Product[];
}
```

### Registrar la relación también en Product

```ts
  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories!: Category[]; 
```

### Registrarlo en app.module.ts

```ts
  entities: [User, Order, OrderItem, Product, Profile],
```

# QueryBuilder

Vamos a probar distintos queryes asi que creemos en order controller

```ts
  @Get('test-query-builder') {
    return this.orderService.testQueryBuilder();
  }
```
y en el service

```ts
  async testQueryBuilder() {    
    //
    return rows    
  }
```

## Ejemplo 1

Obtener las ordenes con el nombre del usuario con su teléfono al mismo nivel

```ts
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.user', 'u')
      .leftJoin('u.profile', 'p')
      .select(['o.id AS orderId', 'u.name AS userName', 'p.phone AS phone'])
      .limit(20)
      .getRawMany();
```

## Ejemplo 2

Obtener las órdenes cuyo usuario tenga perfil con teléfono que empiece en 9000.

```ts
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('o.user', 'u')
      .leftJoinAndSelect('u.profile', 'p')
      .where('p.phone LIKE :phone', { phone: '9000%' })
      .orderBy('o.id', 'DESC')
      .getMany();
```

## Ejemplo 3

Obtener las ordenes con su cantidad de items vendidos, pero solo los que tengan más de 2 items vendidos.

```ts
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.items', 'oi')
      .select('o.id', 'orderId')
      .addSelect('COUNT(oi.id)', 'itemsCount')
      .groupBy('o.id')
      .having('COUNT(oi.id) > :minItems', { minItems: 2 })
      .orderBy('o.id', 'DESC')
      .getRawMany();
```

## Ejemplo 4

Productos que pertenecen a la categoría 16

```ts
    const rows = await this.repo
      .createQueryBuilder('p')
      .innerJoin('product_categories_categories', 'pcc', 'pcc.productId = p.id')
      .innerJoin('categories', 'c', 'c.id = pcc.categoriesId')
      .where('c.name = :categoryName', { categoryName: 'Category 16' })
      .orderBy('p.id', 'ASC')
      .getMany();
```

## Ejemplo 5

Top 20 usuarios que han comprado más

```ts
    const rows = await this.repo
      .createQueryBuilder('u')
      .innerJoin('u.orders', 'o')
      .innerJoin('o.items', 'oi')
      .innerJoin('oi.product', 'p')
      .select('u.id', 'userId')
      .addSelect('u.name', 'userName')
      .addSelect('SUM(oi.quantity * p.price)', 'totalSpent')
      .groupBy('u.id')
      .addGroupBy('u.name')
      .orderBy('totalSpent', 'DESC')
      .limit(20)
      .getRawMany();
```

# Indices

## Crear índice en la columna name de product

```ts
  @Index('idx_product_name')
  @Column()
  name!: string;
```

# Redis

## Descargar 

Another Redis Desktop Manager
[https://goanother.com/](https://goanother.com/)

Redis Insight
[https://redis.io/insight/](https://redis.io/insight/)

## Agregar a docker-compose.yml

  redis:
    image: redis:6.2
    command: redis-server --protected-mode no  # Desactiva protección
    ports:
      - "6379:6379"


## Agregar al .env del proyecto nestjs

REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_TTL=60000

## Instalar las dependencias

pnpm add @nestjs/cache-manager cache-manager keyv @keyv/redis

## Agregar el CacheModule al app.module.ts

```ts
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

...

  imports: [
    CacheModule.register({
        isGlobal: true,
        ttl: Number(process.env.REDIS_TTL ?? 60000), // milisegundos
        stores: [
          new KeyvRedis(
            `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6380}`,
          ),
        ],
      }),
  ],
```

## En el service que quieras usar cache

En este caso user.service.ts

```ts
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

...

  async findOne(id: number) {
    const cacheKey = `product:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('Usuario se obtuvo de cache', id);
      return cached;
    }

    console.log('Usuario se obtuvo de base de datos', id);

    const user = await this.repo.findOne({
      where: { id },
      relations: ['orders'],
    });
    await this.cacheManager.set(cacheKey, user, 30000); // 30s

    return user;
  }
```

## Para trackear el tiempo, cambiemos el controller

```ts
  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.time('findOne');
    const user = await this.userService.findOne(+id);
    console.timeEnd('findOne');
    return user;
  }
```

