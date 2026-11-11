import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @Post('checkout')
  checkout(@CurrentUser() current: AuthUser) {
    return this.ordersService.checkout(current.userId);
  }
}
