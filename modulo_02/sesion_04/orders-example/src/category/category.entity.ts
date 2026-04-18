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