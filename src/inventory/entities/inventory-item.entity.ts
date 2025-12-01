import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductCondition } from '../../common/enums/product-condition.enum';

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  READY_TO_SHIP = 'READY_TO_SHIP',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse, (w) => w.inventoryItems, { eager: true })
  warehouse: Warehouse;

  @ManyToOne(() => Product, (p) => p.inventoryItems, { eager: true })
  product: Product;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'varchar', default: InventoryStatus.AVAILABLE })
  status: InventoryStatus;

  // Estado del producto en este almacén (lote)
  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.NEW,
  })
  condition: ProductCondition;

  // Umbral de stock bajo específico para este almacén
  @Column({ type: 'int', nullable: true })
  reorderLevel?: number;
}
