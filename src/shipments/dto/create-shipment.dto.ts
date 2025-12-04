import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateShipmentDto {
  @IsUUID()
  warehouseId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
