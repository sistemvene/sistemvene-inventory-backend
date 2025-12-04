import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  // El almacenista ve sus comisiones
  @Get('me')
  async getMyCommissions(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const user = req.user;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }
    return this.commissionsService.findForUser(user.sub, from, to);
  }
}
