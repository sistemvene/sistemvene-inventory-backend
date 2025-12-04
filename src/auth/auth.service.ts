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
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Usamos directamente la FK warehouseId del usuario
    const warehouseId: string | null = (user as any).warehouseId ?? null;

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      warehouseId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: (user as any).fullName ?? null,
        role: user.role,
        warehouseId,
      },
    };
  }
}
