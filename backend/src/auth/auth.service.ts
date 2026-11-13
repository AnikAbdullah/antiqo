import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong.');
    }

    const passwordOk = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email or password is wrong.');
    }

    return this.buildResponse(user);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const token = this.resetTokens.create({
      userId: user.id,
      token: randomBytes(24).toString('hex'),
      expiresAt,
      usedAt: null,
    });
    const saved = await this.resetTokens.save(token);
    await this.mail.sendPasswordResetEmail(user.email, saved.token);
    return { token: saved.token, expiresAt: saved.expiresAt };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.resetTokens.findOne({
      where: { token: dto.token },
    });
    if (!record || record.usedAt) {
      throw new BadRequestException('Invalid reset token.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token has expired.');
    }
    const passwordHash = await argon2.hash(dto.newPassword);
    await this.usersService.updatePasswordHash(record.userId, passwordHash);
    record.usedAt = new Date();
    await this.resetTokens.save(record);
    return { reset: true };
  }

  private buildResponse(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
