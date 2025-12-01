"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_config_1 = require("./config/typeorm.config");
const health_module_1 = require("./health/health.module");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const inventory_module_1 = require("./inventory/inventory.module");
const shipments_module_1 = require("./shipments/shipments.module");
const commissions_module_1 = require("./commissions/commissions.module");
const notifications_module_1 = require("./notifications/notifications.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(typeorm_config_1.typeOrmConfig),
            health_module_1.HealthModule,
            warehouses_module_1.WarehousesModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            inventory_module_1.InventoryModule,
            shipments_module_1.ShipmentsModule,
            commissions_module_1.CommissionsModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map