import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createLowStock(item: InventoryItem) {
    const threshold =
      item.reorderLevel ??
      item.product.defaultReorderLevel ??
      null;

    const message = `Stock bajo para ${item.product.name} en almacén ${item.warehouse.code}: ${item.quantity} ${item.product.unit}.`;

    const notif = this.notificationRepo.create({
      type: NotificationType.LOW_STOCK,
      warehouse: item.warehouse,
      product: item.product,
      quantity: item.quantity,
      threshold: threshold ?? undefined,
      message,
    });

    return this.notificationRepo.save(notif);
  }

  async createRestock(item: InventoryItem) {
    const threshold =
      item.reorderLevel ??
      item.product.defaultReorderLevel ??
      null;

    const message = `Reposición de ${item.product.name} en almacén ${item.warehouse.code}: ahora hay ${item.quantity} ${item.product.unit}.`;

    const notif = this.notificationRepo.create({
      type: NotificationType.RESTOCK,
      warehouse: item.warehouse,
      product: item.product,
      quantity: item.quantity,
      threshold: threshold ?? undefined,
      message,
    });

    return this.notificationRepo.save(notif);
  }

  findAll() {
    return this.notificationRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findForWarehouse(warehouseId: string) {
    return this.notificationRepo.find({
      where: { warehouse: { id: warehouseId } },
      order: { createdAt: 'DESC' },
    });
  }

  findForUser(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    const notif = await this.notificationRepo.findOne({ where: { id } });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.read = true;
    return this.notificationRepo.save(notif);
  }
}
