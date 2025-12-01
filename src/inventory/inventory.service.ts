import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InventoryItem,
  InventoryStatus,
} from './entities/inventory-item.entity';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Product } from '../products/entities/product.entity';
import { ProductCondition } from '../common/enums/product-condition.enum';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    private readonly warehousesService: WarehousesService,
    private readonly productsService: ProductsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async upsert(dto: UpsertInventoryDto): Promise<InventoryItem> {
    const warehouse = await this.warehousesService.findOne(dto.warehouseId);
    const product = await this.productsService.findOne(dto.productId);

    let item = await this.inventoryRepo.findOne({
      where: { warehouse: { id: warehouse.id }, product: { id: product.id } },
      relations: ['warehouse', 'product'],
    });

    const previousQuantity = item?.quantity ?? 0;

    if (!item) {
      item = this.inventoryRepo.create({
        warehouse,
        product,
        quantity: dto.quantity,
        status: dto.status,
        condition: dto.condition ?? ProductCondition.NEW,
        reorderLevel:
          dto.reorderLevel ?? product.defaultReorderLevel ?? undefined,
      });
    } else {
      item.quantity = dto.quantity;
      item.status = dto.status;
      if (dto.condition !== undefined) {
        item.condition = dto.condition;
      }
      if (dto.reorderLevel !== undefined) {
        item.reorderLevel = dto.reorderLevel;
      }
    }

    const saved = await this.inventoryRepo.save(item);

    await this.handleStockChange(saved, previousQuantity, product);

    return saved;
  }

  findByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    return this.inventoryRepo.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['warehouse', 'product'],
    });
  }

  async adjustStockForShipment(
    warehouseId: string,
    productId: string,
    quantity: number,
  ): Promise<InventoryItem> {
    const item = await this.inventoryRepo.findOne({
      where: { warehouse: { id: warehouseId }, product: { id: productId } },
      relations: ['warehouse', 'product'],
    });

    if (!item || item.quantity < quantity) {
      throw new BadRequestException('Not enough stock for this shipment');
    }

    const previousQuantity = item.quantity;

    item.quantity -= quantity;
    if (item.quantity === 0) {
      item.status = InventoryStatus.OUT_OF_STOCK;
    }

    const saved = await this.inventoryRepo.save(item);

    await this.handleStockChange(saved, previousQuantity);

    return saved;
  }

  // Vista resumida: stock por producto en un almacén
  async listProductsStockByWarehouse(warehouseId: string) {
    const items = await this.inventoryRepo.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['warehouse', 'product'],
    });

    return items.map((item) => ({
      warehouseId: item.warehouse.id,
      warehouseCode: item.warehouse.code,
      productId: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      unit: item.product.unit,
      quantity: item.quantity,
      status: item.status,
      condition: item.condition,
      reorderLevel:
        item.reorderLevel ?? item.product.defaultReorderLevel ?? null,
    }));
  }

  private async handleStockChange(
    item: InventoryItem,
    previousQuantity: number,
    productFromCaller?: Product,
  ) {
    const product = productFromCaller ?? item.product;

    // Reposición (sube cantidad) -> notificación RESTOCK
    if (item.quantity > previousQuantity) {
      await this.notificationsService.createRestock(item);
    }

    // Stock bajo -> notificación LOW_STOCK
    const threshold =
      item.reorderLevel ??
      product.defaultReorderLevel ??
      null;

    if (threshold != null && item.quantity <= threshold) {
      await this.notificationsService.createLowStock(item);
    }
  }
}
