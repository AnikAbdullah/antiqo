import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
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

  createUser(data: { name: string; email: string; passwordHash: string; role?: UserRole }) {
    const user = this.users.create(data);
    return this.users.save(user);
  }
}
