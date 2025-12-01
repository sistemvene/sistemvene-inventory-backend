import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../entities/commission-record.entity';

export class MarkPaidDto {
  @IsDateString()
  @IsNotEmpty()
  from: string; // inicio del periodo (incluido)

  @IsDateString()
  @IsNotEmpty()
  to: string;   // fin del periodo (incluido, nosotros haremos <=)

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
