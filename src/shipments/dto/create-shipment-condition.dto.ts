import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ConditionType } from '../entities/shipment-condition.entity';
import { ProductCondition } from '../../common/enums/product-condition.enum';

export class CreateShipmentConditionDto {
  @IsEnum(ConditionType)
  type: ConditionType; // RECEPTION o RETURN

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ProductCondition)
  @IsOptional()
  productCondition?: ProductCondition;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  // Usuario que registra la condición (almacenista)
  @IsString()
  @IsNotEmpty()
  userId: string;
}
