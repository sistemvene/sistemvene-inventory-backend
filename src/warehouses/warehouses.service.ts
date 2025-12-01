import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const exists = await this.warehouseRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new Error(`Warehouse with code ${dto.code} already exists`);
    }
    const entity = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(entity);
  }

  findAll(): Promise<Warehouse[]> {
    return this.warehouseRepo.find();
  }

  async findOne(id: string): Promise<Warehouse> {
    const found = await this.warehouseRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('Warehouse not found');
    }
    return found;
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, dto);
    return this.warehouseRepo.save(warehouse);
  }
}
