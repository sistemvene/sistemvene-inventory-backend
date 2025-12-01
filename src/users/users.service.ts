import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { WarehousesService } from '../warehouses/warehouses.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new Error(`User with email ${dto.email} already exists`);
    }

    const user = this.userRepo.create({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      role: dto.role || 'WAREHOUSE_MANAGER',
      commissionPerShipment: dto.commissionPerShipment ?? 0,
    });

    if (dto.warehouseId) {
      const wh = await this.warehousesService.findOne(dto.warehouseId);
      user.warehouse = wh;
    }

    return this.userRepo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['warehouse'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['warehouse'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
