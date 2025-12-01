import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Get('warehouse/:warehouseId')
  findForWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    const user = req.user;
    if (
      user.role === 'WAREHOUSE_MANAGER' &&
      user.warehouse &&
      warehouseId !== user.warehouse.id
    ) {
      throw new ForbiddenException('Cannot see notifications of another warehouse');
    }
    return this.notificationsService.findForWarehouse(warehouseId);
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Get('user/:userId')
  findForUser(@Param('userId') userId: string, @Req() req: any) {
    const user = req.user;
    if (user.role === 'WAREHOUSE_MANAGER' && user.id !== userId) {
      throw new ForbiddenException('Cannot see notifications of another user');
    }
    return this.notificationsService.findForUser(userId);
  }

  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
