import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { ShipmentCondition } from './entities/shipment-condition.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentCondition, CommissionRecord]),
    WarehousesModule,
    ProductsModule,
    UsersModule,
    InventoryModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
