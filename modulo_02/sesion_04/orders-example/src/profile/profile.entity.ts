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