import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { MarkPaidDto } from './dto/mark-paid.dto';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  // Listado simple (opcionalmente con rango from/to)
  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.commissionsService.findByUser(userId, fromDate, toDate);
  }

  // Solo comisiones no pagadas
  @Get('user/:userId/unpaid')
  findUnpaid(@Param('userId') userId: string) {
    return this.commissionsService.findUnpaidByUser(userId);
  }

  // Resumen por periodo (día/semana/mes/año)
  // Ejemplo: /commissions/user/ID/summary?period=month&date=2025-12-01
  @Get('user/:userId/summary')
  getSummary(
    @Param('userId') userId: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
    @Query('date') date?: string,
  ) {
    const refDate = date ? new Date(date) : new Date();
    return this.commissionsService.getSummaryByUserAndPeriod(
      userId,
      period,
      refDate,
    );
  }

  // Marcar como pagadas las comisiones de un rango, con método de pago
  @Post('user/:userId/mark-paid')
  markPaid(@Param('userId') userId: string, @Body() dto: MarkPaidDto) {
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    return this.commissionsService.markAsPaidForUser(
      userId,
      from,
      to,
      dto.paymentMethod,
    );
  }
}
