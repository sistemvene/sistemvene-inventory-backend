import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const volumetricWeight =
      dto.lengthCm && dto.widthCm && dto.heightCm
        ? Math.round((dto.lengthCm * dto.widthCm * dto.heightCm) / 5) // ejemplo de cálculo
        : undefined;

    const product = this.productRepo.create({
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      lengthCm: dto.lengthCm,
      widthCm: dto.widthCm,
      heightCm: dto.heightCm,
      weightGrams: dto.weightGrams,
      volumetricWeightGrams: volumetricWeight,
    });

    if (dto.imageUrls?.length) {
      product.images = dto.imageUrls.map((url) =>
        this.imageRepo.create({ url }),
      );
    }

    return this.productRepo.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['images'] });
  }

  async findOne(id: string): Promise<Product> {
    const found = await this.productRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!found) {
      throw new NotFoundException('Product not found');
    }
    return found;
  }
}
