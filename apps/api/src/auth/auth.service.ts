import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'CUSTOMER' | 'STAFF';
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF';
  exp: number;
}

@Injectable()
export class AuthService {
  private users: UserRecord[] = [
    {
      id: 'user-demo-01',
      email: 'customer@brewlite.vn',
      passwordHash: this.hashPassword('123456'),
      fullName: 'Khách Hàng Demo',
      role: 'CUSTOMER',
    },
    {
      id: 'staff-demo-01',
      email: 'staff@brewlite.vn',
      passwordHash: this.hashPassword('123456'),
      fullName: 'Nhân Viên Quầy',
      role: 'STAFF',
    },
  ];

  private readonly secret = process.env.JWT_SECRET || 'brewlite-secret-key';

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  register(email: string, password: string, fullName: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email không hợp lệ');
    }
    if (!password || password.length < 6) {
      throw new BadRequestException('Mật khẩu phải từ 6 ký tự trở lên');
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new BadRequestException('Họ tên không được để trống');
    }

    const exists = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new BadRequestException('Email đã được đăng ký');
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash: this.hashPassword(password),
      fullName: fullName.trim(),
      role: 'CUSTOMER',
    };
    this.users.push(newUser);

    return this.buildAuthResponse(newUser);
  }

  login(email: string, password: string) {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase(),
    );
    if (!user || user.passwordHash !== this.hashPassword(password || '')) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    return this.buildAuthResponse(user);
  }

  verifyToken(authHeader?: string): JwtPayload {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu hoặc sai định dạng Authorization Bearer token');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('JWT token không hợp lệ');
    }

    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      throw new UnauthorizedException('Chữ ký JWT không hợp lệ');
    }

    const payload: JwtPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    );
    if (Date.now() > payload.exp) {
      throw new UnauthorizedException('JWT token đã hết hạn');
    }
    return payload;
  }

  private buildAuthResponse(user: UserRecord) {
    const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
      'base64url',
    );
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return {
      accessToken: `${headerB64}.${payloadB64}.${signature}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}