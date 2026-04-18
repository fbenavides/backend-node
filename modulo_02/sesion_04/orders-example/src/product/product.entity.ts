import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { OrderItem } from '../order/order-item.entity';
import { Category } from '../category/category.entity';
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('idx_product_name')
  @Column()
  name!: string;

  @Column('decimal')
  price!: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  items!: OrderItem[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories!: Category[];
}
