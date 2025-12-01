import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentCondition } from '../shipments/entities/shipment-condition.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // 👉 En local (vm-dev) usaremos localhost por defecto
  //    En contenedor (dev-app-inventory) se sobreescribe con DB_HOST=postgres
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'inventory_user',
  password: process.env.DB_PASSWORD || 'Inv3ntoryDev!',
  database: process.env.DB_NAME || 'inventorydb',
  entities: [
    Warehouse,
    User,
    Product,
    ProductImage,
    InventoryItem,
    Shipment,
    ShipmentCondition,
    CommissionRecord,
  ],
  synchronize: true, // SOLO DEV
};
