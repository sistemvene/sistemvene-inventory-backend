import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  lengthCm?: number;

  @Column({ type: 'int', nullable: true })
  widthCm?: number;

  @Column({ type: 'int', nullable: true })
  heightCm?: number;

  @Column({ type: 'int', nullable: true })
  weightGrams?: number;

  @Column({ type: 'int', nullable: true })
  volumetricWeightGrams?: number;

  // Unidad (pcs, caja, kg, etc.)
  @Column({ default: 'pcs' })
  unit: string;

  // Umbral global de stock bajo
  @Column({ type: 'int', nullable: true })
  defaultReorderLevel?: number;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @OneToMany(() => InventoryItem, (item) => item.product)
  inventoryItems: InventoryItem[];

  @OneToMany(() => Shipment, (shipment) => shipment.product)
  shipments: Shipment[];
}
