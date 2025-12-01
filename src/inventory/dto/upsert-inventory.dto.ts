import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { InventoryStatus } from '../entities/inventory-item.entity';
import { ProductCondition } from '../../common/enums/product-condition.enum';

export class UpsertInventoryDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsEnum(InventoryStatus)
  status: InventoryStatus;

  // Estado del producto en stock (Nuevo, Usado, etc.)
  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsInt()
  @IsOptional()
  @IsPositive()
  reorderLevel?: number;
}
