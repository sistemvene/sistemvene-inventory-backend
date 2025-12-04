import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InventoryImportService } from './inventory-import.service';

@Controller('inventory')
export class InventoryImportController {
  constructor(private readonly importService: InventoryImportService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async importInventory(
    @UploadedFile() file: any,              // 👈 quitamos Express.Multer.File
    @Body('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    // JwtAuthGuard global => req.user existe
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo el administrador puede importar inventario',
      );
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('Fichero no recibido');
    }
    if (!warehouseId) {
      throw new BadRequestException('warehouseId es obligatorio');
    }

    return this.importService.importForWarehouse(warehouseId, file.buffer);
  }
}
