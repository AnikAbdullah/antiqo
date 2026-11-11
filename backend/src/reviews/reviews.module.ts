import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Shop])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
