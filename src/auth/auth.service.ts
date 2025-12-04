import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

interface LoginDto {
  email: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  warehouseId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async login(dto: LoginDto) {
    // 1) Cargar el usuario junto con la relación 'warehouse'
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['warehouse'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const warehouse = (user as any).warehouse || null;
    const warehouseId: string | null = warehouse ? warehouse.id : null;

    // 2) Construir el payload del JWT con warehouseId
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      warehouseId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 3) Devolver user con warehouseId + info básica de warehouse
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: (user as any).fullName ?? null,
        role: user.role,
        warehouseId,
        warehouse: warehouse
          ? {
              id: warehouse.id,
              code: warehouse.code,
              name: warehouse.name,
            }
          : null,
      },
    };
  }
}
