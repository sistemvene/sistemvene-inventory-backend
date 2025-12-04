import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryImportService } from './inventory-import.service';
import { InventoryImportController } from './inventory-import.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem, Warehouse, Product]),
    NotificationsModule,
  ],
  providers: [InventoryService, InventoryImportService],
  controllers: [InventoryController, InventoryImportController],
  exports: [InventoryService, InventoryImportService],
})
export class InventoryModule {}
