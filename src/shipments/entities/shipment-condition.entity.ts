import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { User } from '../../users/entities/user.entity';
import { ProductCondition } from '../../common/enums/product-condition.enum';

export enum ConditionType {
  RECEPTION = 'RECEPTION', // mercancia recibida (desde sede principal, por ejemplo)
  RETURN = 'RETURN',       // devoluciones de clientes
}

@Entity('shipment_conditions')
export class ShipmentCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.conditions, {
    onDelete: 'CASCADE',
  })
  shipment: Shipment;

  // Usuario (almacenista) que registró la condición
  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  createdBy?: User;

  @Column({
    type: 'enum',
    enum: ConditionType,
  })
  type: ConditionType;

  @Column({ type: 'text' })
  description: string;

  // Estado del producto en esta recepción/devolución
  @Column({
    type: 'enum',
    enum: ProductCondition,
    nullable: true,
  })
  productCondition?: ProductCondition;

  // Lista de URLs de fotos (las imágenes se subirán fuera: S3, Cloudinary, etc.)
  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @CreateDateColumn()
  createdAt: Date;
}
