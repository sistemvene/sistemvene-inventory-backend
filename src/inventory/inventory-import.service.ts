import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { InventoryItem } from './entities/inventory-item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Product } from '../products/entities/product.entity';

interface ImportRow {
  sku: string;
  quantity: number;
  reorderLevel?: number | null;
}

@Injectable()
export class InventoryImportService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async importForWarehouse(warehouseId: string, fileBuffer: Buffer) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const rows = this.parseFile(fileBuffer);
    let created = 0;
    let updated = 0;
    const errors: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // fila 1 = cabecera

      const sku = (row.sku || '').trim();
      const quantity = Number(row.quantity);

      if (!sku || !Number.isFinite(quantity) || quantity < 0) {
        errors.push({
          row: rowNumber,
          sku,
          reason: 'SKU vacío o cantidad inválida',
        });
        continue;
      }

      const product = await this.productRepo.findOne({ where: { sku } });
      if (!product) {
        errors.push({
          row: rowNumber,
          sku,
          reason: 'Producto no encontrado para este SKU',
        });
        continue;
      }

      const existing = await this.inventoryRepo.findOne({
        where: {
          warehouse: { id: warehouseId },
          product: { id: product.id },
        },
        relations: ['warehouse', 'product'],
      });

      const rl =
        row.reorderLevel !== undefined && row.reorderLevel !== null
          ? Number(row.reorderLevel)
          : undefined;

      if (!existing) {
        const createdItem = this.inventoryRepo.create({
          warehouse,
          product,
          quantity,
          reorderLevel:
            rl !== undefined && !Number.isNaN(rl) ? rl : undefined,
        });
        await this.inventoryRepo.save(createdItem);
        created++;
      } else {
        existing.quantity = quantity;
        if (rl !== undefined && !Number.isNaN(rl)) {
          existing.reorderLevel = rl;
        }
        await this.inventoryRepo.save(existing);
        updated++;
      }
    }

    return {
      warehouseId,
      totalRows: rows.length,
      created,
      updated,
      errors,
    };
  }

  private parseFile(fileBuffer: Buffer): ImportRow[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const raw: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    return raw.map((r) => {
      return {
        sku: String(r.sku || r.SKU || '').trim(),
        quantity: r.quantity ?? r.qty ?? r.QTY ?? 0,
        reorderLevel: r.reorderLevel ?? r.min_stock ?? null,
      } as ImportRow;
    });
  }
}
