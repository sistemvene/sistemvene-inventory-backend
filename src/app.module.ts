import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { HealthModule } from './health/health.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { CommissionsModule } from './commissions/commissions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    HealthModule,
    WarehousesModule,
    UsersModule,
    ProductsModule,
    InventoryModule,
    ShipmentsModule,
    CommissionsModule,
    NotificationsModule,
    AuthModule,
  ],
})
export class AppModule {}
