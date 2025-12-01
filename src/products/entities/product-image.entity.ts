import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string; // luego puedes almacenar aquí la ruta/URL en S3, local, etc.

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  product: Product;
}
