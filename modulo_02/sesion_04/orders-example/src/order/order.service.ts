import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
  ) {}

  async createOrder(userId: number, items: { productId: number; quantity: number }[]) {
    const order = this.orderRepo.create({ user: { id: userId } });

    order.items = items.map((i) =>
      this.itemRepo.create({
        product: { id: i.productId },
        quantity: i.quantity,
      }),
    );

    return await this.orderRepo.save(order);
  }

  findAll() {
    return this.orderRepo.find({ relations: ['user', 'items', 'items.product'] });
  }

  async testQueryBuilder() {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('o.user', 'u')
      .leftJoinAndSelect('u.profile', 'p')
      .where('p.phone LIKE :phone', { phone: '9000%' })
      .orderBy('o.id', 'DESC')
      .getMany();
    return rows;
  }
}
