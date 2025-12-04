import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { MarkShipmentShippedDto } from './dto/mark-shipped.dto';
import { AddShipmentConditionDto } from './dto/add-condition.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  // Crear envío (normalmente ADMIN)
  @Post()
  async create(@Body() dto: CreateShipmentDto, @Req() req: any) {
    const user = req.user;
    return this.shipmentsService.create(dto, user);
  }

  // Ver envíos por almacén (ADMIN, o manager solo si es su almacén)
  @Get('warehouse/:warehouseId')
  async findByWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.shipmentsService.findByWarehouse(warehouseId, user);
  }

  // El almacenista ve SOLO sus envíos
  @Get('my')
  async findMyShipments(@Req() req: any) {
    const user = req.user;
    return this.shipmentsService.findMyShipments(user);
  }

  // Marcar envío como "enviado" con número de guía
  @Patch(':id/mark-shipped')
  async markShipped(
    @Param('id') id: string,
    @Body() dto: MarkShipmentShippedDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.shipmentsService.markShipped(id, dto, user);
  }

  // Añadir condiciones de recepción / devolución + fotos
  @Post(':id/conditions')
  async addCondition(
    @Param('id') id: string,
    @Body() dto: AddShipmentConditionDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.shipmentsService.addCondition(id, dto, user);
  }
}
