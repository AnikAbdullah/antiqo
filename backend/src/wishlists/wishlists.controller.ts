import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Roles(UserRole.BUYER)
  @Post(':productId')
  add(
    @CurrentUser() current: AuthUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistsService.add(current.userId, productId);
  }

  @Roles(UserRole.BUYER)
  @Get()
  list(@CurrentUser() current: AuthUser) {
    return this.wishlistsService.list(current.userId);
  }

  @Roles(UserRole.BUYER)
  @Delete(':productId')
  remove(
    @CurrentUser() current: AuthUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistsService.remove(current.userId, productId);
  }
}
