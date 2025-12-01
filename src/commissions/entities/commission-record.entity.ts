import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum PaymentMethod {
  NONE = 'NONE',
  ZELLE = 'ZELLE',
  BIZUM = 'BIZUM',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
}

@Entity('commission_records')
export class CommissionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.commissions, { eager: true })
  user: User; // almacenista/encargado

  @ManyToOne(() => Shipment, (s) => s.commissions, { eager: true })
  shipment: Shipment;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number; // comisión por este envío

  @CreateDateColumn()
  createdAt: Date; // fecha en que se generó la comisión (envío realizado)

  @Column({ default: false })
  paid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.NONE,
  })
  paymentMethod: PaymentMethod;
}
