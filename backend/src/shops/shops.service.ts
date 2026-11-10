import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
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
}
