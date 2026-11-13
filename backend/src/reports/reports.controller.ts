import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.BUYER)
  @Post()
  create(@CurrentUser() current: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(current.userId, dto);
  }

  @Public()
  @Get()
  listByShop(@Query('shopId', ParseIntPipe) shopId: number) {
    return this.reviewsService.listByShop(shopId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/moderate')
  moderate(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.moderate(id);
  }
}