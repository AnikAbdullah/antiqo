import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
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

  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.approve(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.reject(id);
  }

  @Public()
  @Get(':id')
  getPublicShop(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.getPublicShop(id);
  }
}
