import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { CommissionRecord } from './entities/commission-record.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommissionRecord]),
    UsersModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
