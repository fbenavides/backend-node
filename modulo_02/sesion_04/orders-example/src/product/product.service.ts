import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,) {}

  findAll() {
    return this.repo.find();
  }


  async create(data: CreateProductDto) {
    const product = this.repo.create(data);
    return await this.repo.save(product);
  }

  async findOne(id: number) {
    const cacheKey = `product:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('Usuario se obtuvo de cache', id);
      return cached;
    }

    console.log('Usuario se obtuvo de base de datos', id);

    const user = await this.repo.findOne({
      where: { id }
    });
    await this.cacheManager.set(cacheKey, user, 30000); // 30s

    return user;
  }
}
