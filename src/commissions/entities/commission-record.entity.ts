import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum PaymentMethod {
  NONE = 'NONE',
  ZELLE = 'ZELLE',
  BIZUM = 'BIZUM',
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
  DEPOSIT = 'DEPOSIT',
}

@Entity('commission_records')
export class CommissionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Warehouse, { eager: true, onDelete: 'CASCADE' })
  warehouse: Warehouse;

  @ManyToOne(() => Shipment, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  shipment: Shipment | null;

  @Column('numeric', { precision: 10, scale: 2 })
  amount: string;

  @Column({ length: 3, default: 'EUR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ type: 'int' })
  periodYear: number;

  @Column({ type: 'int' })
  periodMonth: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.NONE,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
