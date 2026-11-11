import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
  ) {}

  async create(buyerId: number, dto: CreateReviewDto) {
    const shop = await this.shops.findOne({ where: { id: dto.shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    const review = this.reviews.create({
      buyerId,
      shopId: dto.shopId,
      rating: dto.rating,
      body: dto.body,
    });
    return this.reviews.save(review);
  }
}
