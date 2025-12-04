import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { ShipmentCondition } from './shipment-condition.entity';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse, (w) => w.id, { eager: true, onDelete: 'CASCADE' })
  warehouse: Warehouse;

  @ManyToOne(() => Product, (p) => p.id, { eager: true, onDelete: 'CASCADE' })
  product: Product;

  @Column('int')
  quantity: number;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  // 👉 Aquí el cambio importante: tipo explícito 'varchar'
  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber: string | null;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  requestedBy: User | null;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  performedBy: User | null;

  @OneToMany(() => ShipmentCondition, (c) => c.shipment, { cascade: true })
  conditions: ShipmentCondition[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
