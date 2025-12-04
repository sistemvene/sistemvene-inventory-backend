import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShipmentConditionType } from '../entities/shipment-condition.entity';

export class AddShipmentConditionDto {
  @IsEnum(ShipmentConditionType)
  type: ShipmentConditionType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
