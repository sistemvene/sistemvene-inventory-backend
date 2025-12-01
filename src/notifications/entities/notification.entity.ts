import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  RESTOCK = 'RESTOCK',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ManyToOne(() => Warehouse, { eager: true, nullable: true })
  warehouse?: Warehouse;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  product?: Product;

  @ManyToOne(() => User, { eager: true, nullable: true })
  user?: User;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ type: 'int', nullable: true })
  threshold?: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
