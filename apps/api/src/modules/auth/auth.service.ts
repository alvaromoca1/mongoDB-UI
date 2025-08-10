import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const ok = email === (process.env.ADMIN_EMAIL || 'admin@example.com') && password === (process.env.ADMIN_PASSWORD || 'admin123');
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    const token = await this.jwt.signAsync({ sub: 'admin', role: 'admin' });
    return { token };
  }
}


