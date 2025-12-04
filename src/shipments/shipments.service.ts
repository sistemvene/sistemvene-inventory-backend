import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import {
  ShipmentCondition,
  ShipmentConditionType,
} from './entities/shipment-condition.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { MarkShipmentShippedDto } from './dto/mark-shipped.dto';
import { AddShipmentConditionDto } from './dto/add-condition.dto';
import { CommissionsService } from '../commissions/commissions.service';

interface AuthUser {
  sub: string;
  role: string;
  warehouseId?: string | null;
}

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentCondition)
    private readonly conditionRepo: Repository<ShipmentCondition>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    private readonly commissionsService: CommissionsService,
  ) {}

  async create(dto: CreateShipmentDto, authUser: AuthUser) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let requestedBy: User | null = null;
    if (authUser?.sub) {
      requestedBy = await this.userRepo.findOne({
        where: { id: authUser.sub },
      });
    }

    const shipment = this.shipmentRepo.create({
      warehouse,
      product,
      quantity: dto.quantity,
      status: ShipmentStatus.PENDING,
      trackingNumber: null,
      requestedBy: requestedBy || null,
      performedBy: null,
    });

    return this.shipmentRepo.save(shipment);
  }

  async findByWarehouse(warehouseId: string, authUser: AuthUser) {
    // Si es manager solo puede ver su almacén
    if (
      authUser.role === 'WAREHOUSE_MANAGER' &&
      authUser.warehouseId &&
      authUser.warehouseId !== warehouseId
    ) {
      throw new ForbiddenException('No puedes ver envíos de otro almacén');
    }

    return this.shipmentRepo.find({
      where: { warehouse: { id: warehouseId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyShipments(authUser: AuthUser) {
    if (!authUser.warehouseId) {
      throw new ForbiddenException('No tienes almacén asignado');
    }
    return this.findByWarehouse(authUser.warehouseId, authUser);
  }

  async markShipped(
    id: string,
    dto: MarkShipmentShippedDto,
    authUser: AuthUser,
  ) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['warehouse', 'product', 'performedBy', 'requestedBy'],
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Control de acceso: manager solo su almacén
    if (
      authUser.role === 'WAREHOUSE_MANAGER' &&
      authUser.warehouseId &&
      shipment.warehouse.id !== authUser.warehouseId
    ) {
      throw new ForbiddenException('No puedes modificar envíos de otro almacén');
    }

    if (shipment.status === ShipmentStatus.SHIPPED) {
      // idempotente
      return shipment;
    }

    // Ajustar inventario (restar cantidad)
    await this.adjustInventoryOnShipment(
      shipment.warehouse.id,
      shipment.product.id,
      shipment.quantity,
    );

    shipment.status = ShipmentStatus.SHIPPED;
    shipment.trackingNumber = dto.trackingNumber;

    if (authUser?.sub) {
      const performer = await this.userRepo.findOne({
        where: { id: authUser.sub },
      });
      if (performer) {
        shipment.performedBy = performer;
      }
    }

    const saved = await this.shipmentRepo.save(shipment);

    // Crear registro de comisión
    await this.commissionsService.createForShipment(saved);

    return saved;
  }

  async addCondition(
    shipmentId: string,
    dto: AddShipmentConditionDto,
    authUser: AuthUser,
  ) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
      relations: ['warehouse'],
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (
      authUser.role === 'WAREHOUSE_MANAGER' &&
      authUser.warehouseId &&
      shipment.warehouse.id !== authUser.warehouseId
    ) {
      throw new ForbiddenException('No puedes modificar envíos de otro almacén');
    }

    let createdBy: User | null = null;
    if (authUser?.sub) {
      createdBy = await this.userRepo.findOne({ where: { id: authUser.sub } });
    }

    const condition = this.conditionRepo.create({
      shipment,
      createdBy,
      type: dto.type,
      description: dto.description,
      photos: dto.photos && dto.photos.length ? dto.photos : null,
    });

    return this.conditionRepo.save(condition);
  }

  private async adjustInventoryOnShipment(
    warehouseId: string,
    productId: string,
    quantity: number,
  ) {
    const item = await this.inventoryRepo.findOne({
      where: {
        warehouse: { id: warehouseId },
        product: { id: productId },
      },
      relations: ['warehouse', 'product'],
    });

    if (!item) {
      throw new NotFoundException(
        'No hay inventario para este producto en el almacén',
      );
    }

    if (item.quantity < quantity) {
      throw new ForbiddenException('Stock insuficiente para el envío');
    }

    item.quantity = item.quantity - quantity;
    await this.inventoryRepo.save(item);
  }
}
