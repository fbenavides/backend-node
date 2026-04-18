import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { Product } from './product/product.entity';
import { Profile } from './profile/profile.entity';
import { Category } from './category/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [User, Order, OrderItem, Product, Profile, Category],
      synchronize: false,
    }),
    CacheModule.register({
        isGlobal: true,
        ttl: Number(process.env.REDIS_TTL ?? 60000), // milisegundos
        stores: [
          new KeyvRedis(
            `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6380}`,
          ),
        ],
      }),
    OrderModule,
    ProductModule,
    UserModule,
  ],
})
export class AppModule {}
