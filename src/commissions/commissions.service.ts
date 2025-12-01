import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { CommissionRecord, PaymentMethod } from './entities/commission-record.entity';

type Period = 'day' | 'week' | 'month' | 'year';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionRecord)
    private readonly commissionRepo: Repository<CommissionRecord>,
  ) {}

  async findByUser(userId: string, from?: Date, to?: Date) {
    const where: any = { user: { id: userId } };

    if (from && to) {
      where.createdAt = Between(from, to);
    } else if (from) {
      where.createdAt = MoreThanOrEqual(from);
    } else if (to) {
      where.createdAt = LessThanOrEqual(to);
    }

    const records = await this.commissionRepo.find({ where });

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      total,
      count: records.length,
      records,
    };
  }

  async findUnpaidByUser(userId: string) {
    const records = await this.commissionRepo.find({
      where: { user: { id: userId }, paid: false },
    });

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      total,
      count: records.length,
      records,
    };
  }

  private getPeriodRange(period: Period, ref: Date): { from: Date; to: Date } {
    const from = new Date(ref);
    from.setHours(0, 0, 0, 0);

    let to: Date;

    switch (period) {
      case 'day':
        to = new Date(from);
        to.setDate(to.getDate() + 1);
        break;

      case 'week': {
        // Lunes como inicio de semana
        const day = from.getDay(); // 0=domingo, 1=lunes, ...
        const diff = (day + 6) % 7; // días desde lunes
        from.setDate(from.getDate() - diff);
        to = new Date(from);
        to.setDate(to.getDate() + 7);
        break;
      }

      case 'month':
        from.setDate(1);
        to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        break;

      case 'year':
        from.setMonth(0, 1);
        to = new Date(from);
        to.setFullYear(to.getFullYear() + 1);
        break;

      default:
        throw new BadRequestException(`Invalid period: ${period}`);
    }

    return { from, to };
  }

  async getSummaryByUserAndPeriod(
    userId: string,
    period: Period,
    date: Date,
  ) {
    const { from, to } = this.getPeriodRange(period, date);

    const records = await this.commissionRepo.find({
      where: {
        user: { id: userId },
        createdAt: Between(from, to),
      },
    });

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const paidTotal = records
      .filter((r) => r.paid)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const unpaidTotal = total - paidTotal;

    return {
      period,
      from,
      to,
      total,
      paidTotal,
      unpaidTotal,
      count: records.length,
    };
  }

  async markAsPaidForUser(
    userId: string,
    from: Date,
    to: Date,
    paymentMethod: PaymentMethod,
  ) {
    if (from > to) {
      throw new BadRequestException('"from" cannot be after "to"');
    }

    const records = await this.commissionRepo.find({
      where: {
        user: { id: userId },
        createdAt: Between(from, to),
        paid: false,
      },
    });

    const now = new Date();

    for (const r of records) {
      r.paid = true;
      r.paidAt = now;
      r.paymentMethod = paymentMethod;
    }

    if (records.length === 0) {
      return {
        updated: 0,
        totalPaid: 0,
        from,
        to,
        paymentMethod,
      };
    }

    const saved = await this.commissionRepo.save(records);
    const totalPaid = saved.reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      updated: saved.length,
      totalPaid,
      from,
      to,
      paymentMethod,
    };
  }
}
