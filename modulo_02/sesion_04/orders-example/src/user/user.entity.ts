import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Order } from '../order/order.entity';
import { Profile } from '../profile/profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Order, (order) => order.user)
  // @OneToMany(() => Order, (order) => order.user, { eager: true })
  orders!: Order[];
  // orders!: Promise<Order[]>;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;
}
