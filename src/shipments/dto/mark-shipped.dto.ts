import { IsNotEmpty, IsString } from 'class-validator';

export class MarkShipmentShippedDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;
}
