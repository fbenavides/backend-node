import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private repo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['orders'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
    // return this.repo.findOne({ where: { id }, relations: ['orders'] });
  }

  async findOneLazy(id: number) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) return null;

    // Accedemos a la relación lazy
    const orders = await user.orders;

    // Devolvemos el objeto completo (con las órdenes ya resueltas)
    return {
      id: user.id,
      name: user.name,
      orders: orders.map((order) => ({
        id: order.id,
      })),
    };
  }

  async findOneSql(id: number) {
    const rows = await this.dataSource.query(
      `
        SELECT
          u.id,
          u.name
        FROM user u  
        WHERE u.id = ?
      `,
      [id],
    );

    return rows[0];
  }

  async create(data: CreateUserDto) {
    const user = this.repo.create(data);
    return await this.repo.save(user);
  }

}
