import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  role: string;
  warehouseId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'changeme', // usa el mismo secreto que en AuthModule
    });
  }

  async validate(payload: JwtPayload) {
    // Esto es lo que acaba en req.user
    return {
      sub: payload.sub,
      role: payload.role,
      warehouseId: payload.warehouseId ?? null,
    };
  }
}
