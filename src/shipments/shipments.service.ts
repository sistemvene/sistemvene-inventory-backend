import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import {
  ConditionType,
  ShipmentCondition,
} from './entities/shipment-condition.entity';
import { CommissionRecord, PaymentMethod } from '../commissions/entities/commission-record.entity';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CreateShipmentConditionDto } from './dto/create-shipment-condition.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentCondition)
    private readonly condRepo: Repository<ShipmentCondition>,
    @InjectRepository(CommissionRecord)
    private readonly commissionRepo: Repository<CommissionRecord>,
    private readonly warehousesService: WarehousesService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly inventoryService: InventoryService,
  ) {}

  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const warehouse = await this.warehousesService.findOne(dto.warehouseId);
    const product = await this.productsService.findOne(dto.productId);
    const user = await this.usersService.findOne(dto.userId);

    // Descontar stock
    await this.inventoryService.adjustStockForShipment(
      warehouse.id,
      product.id,
      dto.quantity,
    );

    const shipment = this.shipmentRepo.create({
      warehouse,
      product,
      quantity: dto.quantity,
      labelNumber: dto.labelNumber,
      trackingNumber: dto.trackingNumber,
      status: ShipmentStatus.SHIPPED,
    });

    const saved = await this.shipmentRepo.save(shipment);

    // Crear registro de comisión
    const commissionAmount =
      Number(user.commissionPerShipment || 0) * dto.quantity;

    if (commissionAmount > 0) {
      const commission = this.commissionRepo.create({
        user,
        shipment: saved,
        amount: commissionAmount,
        paid: false,
        paymentMethod: PaymentMethod.NONE,
      });
      await this.commissionRepo.save(commission);
    }

    return saved;
  }

  findAll(): Promise<Shipment[]> {
    return this.shipmentRepo.find({ relations: ['warehouse', 'product'] });
  }

  async addCondition(
    shipmentId: string,
    dto: CreateShipmentConditionDto,
  ): Promise<ShipmentCondition> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
      relations: ['warehouse', 'product'],
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const user = await this.usersService.findOne(dto.userId);

    const condition = this.condRepo.create({
      shipment,
      createdBy: user,
      type: dto.type,
      description: dto.description,
      productCondition: dto.productCondition,
      photos: dto.photos,
    });

    return this.condRepo.save(condition);
  }

  listConditions(shipmentId: string): Promise<ShipmentCondition[]> {
    return this.condRepo.find({
      where: { shipment: { id: shipmentId } },
      order: { createdAt: 'ASC' },
    });
  }
}
