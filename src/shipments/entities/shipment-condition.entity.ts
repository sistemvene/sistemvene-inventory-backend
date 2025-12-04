import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { User } from '../../users/entities/user.entity';

export enum ShipmentConditionType {
  RECEPTION = 'RECEPTION',
  RETURN = 'RETURN',
}

@Entity('shipment_conditions')
export class ShipmentCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (s) => s.conditions, {
    onDelete: 'CASCADE',
  })
  shipment: Shipment;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  createdBy: User | null;

  @Column({
    type: 'enum',
    enum: ShipmentConditionType,
  })
  type: ShipmentConditionType;

  @Column('text')
  description: string;

  @Column('text', { array: true, nullable: true })
  photos: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
}
