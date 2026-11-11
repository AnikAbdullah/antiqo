import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
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
}
