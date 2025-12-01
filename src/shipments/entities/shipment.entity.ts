import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { ShipmentCondition } from './shipment-condition.entity';
import { CommissionRecord } from '../../commissions/entities/commission-record.entity';

export enum ShipmentStatus {
  PENDING = 'PENDING',
  LABEL_GENERATED = 'LABEL_GENERATED',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse, (w) => w.shipments, { eager: true })
  warehouse: Warehouse;

  @ManyToOne(() => Product, (p) => p.shipments, { eager: true })
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ nullable: true })
  labelNumber?: string; // número de etiqueta interno

  @Column({ nullable: true })
  trackingNumber?: string; // número de guía / seguimiento

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ShipmentCondition, (cond) => cond.shipment, { cascade: true })
  conditions: ShipmentCondition[];

  @OneToMany(() => CommissionRecord, (c) => c.shipment)
  commissions: CommissionRecord[];
}
