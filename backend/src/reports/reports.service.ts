import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Order } from '../orders/entities/order.entity';
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
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  async create(buyerId: number, dto: CreateReviewDto) {
    const shop = await this.shops.findOne({ where: { id: dto.shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    const deliveredOrder = await this.orders.findOne({
      where: { buyerId, shopId: dto.shopId, status: OrderStatus.DELIVERED },
    });
    if (!deliveredOrder) {
      throw new ForbiddenException(
        'You can only review a shop after a delivered order.',
      );
    }
    const review = this.reviews.create({
      buyerId,
      shopId: dto.shopId,
      rating: dto.rating,
      body: dto.body,
    });
    return this.reviews.save(review);
  }

  listByShop(shopId: number) {
    return this.reviews.find({
      where: { shopId, visible: true },
      relations: { buyer: true },
      order: { createdAt: 'DESC' },
    });
  }

  async moderate(id: number) {
    const review = await this.reviews.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found.');
    }
    review.visible = false;
    return this.reviews.save(review);
  }
}