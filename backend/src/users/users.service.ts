import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { MailService } from '../mail/mail.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private readonly verificationTokens: Repository<EmailVerificationToken>,
    private readonly mail: MailService,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async getProfile(id: number) {
    const user = await this.findById(id);
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(id: number, changes: { name?: string }) {
    const user = await this.findById(id);
    if (changes.name !== undefined) {
      user.name = changes.name;
    }
    const saved = await this.users.save(user);
    const { passwordHash, ...profile } = saved;
    return profile;
  }

  createUser(data: { name: string; email: string; passwordHash: string; role?: UserRole }) {
    const user = this.users.create(data);
    return this.users.save(user);
  }

  async setStatus(id: number, status: UserStatus) {
    const user = await this.findById(id);
    user.status = status;
    const saved = await this.users.save(user);
    const { passwordHash, ...profile } = saved;
    return profile;
  }

  suspend(id: number) {
    return this.setStatus(id, UserStatus.SUSPENDED);
  }

  reactivate(id: number) {
    return this.setStatus(id, UserStatus.ACTIVE);
  }

  async updatePasswordHash(userId: number, passwordHash: string) {
    const user = await this.findById(userId);
    user.passwordHash = passwordHash;
    return this.users.save(user);
  }

  async requestEmailVerification(userId: number) {
    const user = await this.findById(userId);
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified.');
    }
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const token = this.verificationTokens.create({
      userId: user.id,
      token: randomBytes(24).toString('hex'),
      expiresAt,
      usedAt: null,
    });
    const saved = await this.verificationTokens.save(token);
    await this.mail.sendVerificationEmail(user.email, saved.token);
    return { token: saved.token, expiresAt: saved.expiresAt };
  }

  async verifyEmail(rawToken: string) {
    const record = await this.verificationTokens.findOne({
      where: { token: rawToken },
    });
    if (!record || record.usedAt) {
      throw new BadRequestException('Invalid verification token.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification token has expired.');
    }
    const user = await this.findById(record.userId);
    user.emailVerified = true;
    await this.users.save(user);
    record.usedAt = new Date();
    await this.verificationTokens.save(record);
    return { verified: true };
  }
}
