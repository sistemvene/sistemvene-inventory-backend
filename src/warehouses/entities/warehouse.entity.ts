import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // código interno del almacén

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @OneToMany(() => User, (user) => user.warehouse)
  users: User[];

  @OneToMany(() => InventoryItem, (inv) => inv.warehouse)
  inventoryItems: InventoryItem[];

  @OneToMany(() => Shipment, (shipment) => shipment.warehouse)
  shipments: Shipment[];
}
