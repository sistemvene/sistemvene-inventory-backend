import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CommissionRecord,
  CommissionStatus,
  PaymentMethod,
} from './entities/commission-record.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionRecord)
    private readonly repo: Repository<CommissionRecord>,
  ) {}

  // Crear una comisión cuando un envío se marca como enviado
  async createForShipment(shipment: Shipment) {
    const user = shipment.performedBy || shipment.requestedBy;
    if (!user) {
      return;
    }

    const amountPerShipment = Number(
      process.env.COMMISSION_PER_SHIPMENT || '1',
    ); // fijo por envío (podemos refinarlo luego)
    const amount = amountPerShipment;
    const currency = process.env.COMMISSION_CURRENCY || 'EUR';

    const date = shipment.createdAt || new Date();
    const periodYear = date.getUTCFullYear();
    const periodMonth = date.getUTCMonth() + 1;

    const record = this.repo.create({
      user,
      warehouse: shipment.warehouse,
      shipment,
      amount: amount.toFixed(2),
      currency,
      status: CommissionStatus.PENDING,
      periodYear,
      periodMonth,
      paymentMethod: PaymentMethod.NONE,
      paidAt: null,
    });

    return this.repo.save(record);
  }

  // Comisiones de un usuario en un rango de fechas
  async findForUser(userId: string, from?: string, to?: string) {
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.shipment', 'shipment')
      .leftJoinAndSelect('c.warehouse', 'warehouse')
      .where('c.userId = :userId', { userId });

    if (from) {
      qb.andWhere('c.createdAt >= :from', { from });
    }
    if (to) {
      qb.andWhere('c.createdAt <= :to', { to });
    }

    const records = await qb.orderBy('c.createdAt', 'DESC').getMany();
    const totalAmount = records.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );

    return {
      totalAmount,
      currency: records[0]?.currency || 'EUR',
      records,
    };
  }
}
