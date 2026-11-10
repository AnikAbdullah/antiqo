import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('apply')
  apply(@CurrentUser() current: AuthUser, @Body() dto: CreateShopDto) {
    return this.shopsService.apply(current.userId, dto);
  }

  @Get('me')
  getOwn(@CurrentUser() current: AuthUser) {
    return this.shopsService.getOwn(current.userId);
  }
}
