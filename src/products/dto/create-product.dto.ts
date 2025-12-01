import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  lengthCm?: number;

  @IsInt()
  @IsOptional()
  widthCm?: number;

  @IsInt()
  @IsOptional()
  heightCm?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  weightGrams?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}
