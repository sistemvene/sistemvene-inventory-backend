import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CreateShipmentConditionDto } from './dto/create-shipment-condition.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.createShipment(dto);
  }

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Post(':id/conditions')
  addCondition(
    @Param('id') shipmentId: string,
    @Body() dto: CreateShipmentConditionDto,
  ) {
    return this.shipmentsService.addCondition(shipmentId, dto);
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Get(':id/conditions')
  listConditions(@Param('id') shipmentId: string) {
    return this.shipmentsService.listConditions(shipmentId);
  }
}
