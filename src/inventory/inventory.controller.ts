import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Post()
  upsert(@Body() dto: UpsertInventoryDto, @Req() req: any) {
    const user = req.user;
    if (
      user.role === 'WAREHOUSE_MANAGER' &&
      user.warehouse &&
      dto.warehouseId !== user.warehouse.id
    ) {
      throw new ForbiddenException('Cannot manage inventory of another warehouse');
    }
    return this.inventoryService.upsert(dto);
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Get('warehouse/:warehouseId')
  findByWarehouse(@Param('warehouseId') warehouseId: string, @Req() req: any) {
    const user = req.user;
    if (
      user.role === 'WAREHOUSE_MANAGER' &&
      user.warehouse &&
      warehouseId !== user.warehouse.id
    ) {
      throw new ForbiddenException('Cannot view inventory of another warehouse');
    }
    return this.inventoryService.findByWarehouse(warehouseId);
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Get('warehouse/:warehouseId/products')
  listProductsStock(
    @Param('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    const user = req.user;
    if (
      user.role === 'WAREHOUSE_MANAGER' &&
      user.warehouse &&
      warehouseId !== user.warehouse.id
    ) {
      throw new ForbiddenException('Cannot view inventory of another warehouse');
    }
    return this.inventoryService.listProductsStockByWarehouse(warehouseId);
  }
}
