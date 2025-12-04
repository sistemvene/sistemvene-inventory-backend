import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentCondition } from '../shipments/entities/shipment-condition.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';
import { Notification } from '../notifications/entities/notification.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'inventory',
  password: process.env.DB_PASSWORD || 'inventory',
  database: process.env.DB_NAME || 'inventory_db',
  entities: [
    Warehouse,
    User,
    Product,
    InventoryItem,
    Shipment,
    ShipmentCondition,
    CommissionRecord,
    Notification,
  ],
  synchronize: true,
  logging: false,
};
