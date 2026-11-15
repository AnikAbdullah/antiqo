import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalStatus } from '../common/enums/approval-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async apply(sellerId: number, dto: CreateShopDto) {
    const existing = await this.shops.findOne({ where: { sellerId } });
    if (existing) {
      throw new ConflictException('You already have a shop.');
    }
    const shop = this.shops.create({ sellerId, name: dto.name });
    return this.shops.save(shop);
  }

  async getOwn(sellerId: number) {
    const shop = await this.shops.findOne({ where: { sellerId } });
    if (!shop) {
      throw new NotFoundException('You do not have a shop yet.');
    }
    return shop;
  }

  async approve(id: number) {
    const shop = await this.shops.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    shop.approvalStatus = ApprovalStatus.APPROVED;
    await this.shops.save(shop);

    const owner = await this.users.findOne({ where: { id: shop.sellerId } });
    if (owner && owner.role === UserRole.BUYER) {
      owner.role = UserRole.SELLER;
      await this.users.save(owner);
    }
    return shop;
  }

  async reject(id: number) {
    const shop = await this.shops.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    shop.approvalStatus = ApprovalStatus.REJECTED;
    return this.shops.save(shop);
  }
}
