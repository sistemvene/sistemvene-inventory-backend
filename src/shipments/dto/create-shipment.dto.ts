import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  labelNumber?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsNotEmpty()
  userId: string; // encargado que realiza el envío
}
