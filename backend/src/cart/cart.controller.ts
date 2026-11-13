import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Roles(UserRole.BUYER)
  @Post()
  add(@CurrentUser() current: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cartService.add(current.userId, dto);
  }

  @Roles(UserRole.BUYER)
  @Get()
  view(@CurrentUser() current: AuthUser) {
    return this.cartService.viewCart(current.userId);
  }

  @Roles(UserRole.BUYER)
  @Patch(':productId')
  changeQuantity(
    @CurrentUser() current: AuthUser,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.changeQuantity(current.userId, productId, dto.quantity);
  }

  @Roles(UserRole.BUYER)
  @Delete(':productId')
  remove(
    @CurrentUser() current: AuthUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeItem(current.userId, productId);
  }
}
