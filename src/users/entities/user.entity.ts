import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { CommissionRecord } from '../../commissions/entities/commission-record.entity';

export type UserRole = 'ADMIN' | 'WAREHOUSE_MANAGER';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  whatsapp?: string;

  @Column({ type: 'varchar', default: 'WAREHOUSE_MANAGER' })
  role: UserRole;

  // comisión fija X por envío (puedes cambiar la lógica luego)
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  commissionPerShipment: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Warehouse, (w) => w.users, { nullable: true })
  warehouse?: Warehouse;

  @OneToMany(() => CommissionRecord, (c) => c.user)
  commissions: CommissionRecord[];
}
