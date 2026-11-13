import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Roles(UserRole.BUYER)
  @Get()
  list(@CurrentUser() current: AuthUser) {
    return this.ordersService.listForBuyer(current.userId);
  }

  @Roles(UserRole.BUYER)
  @Get(':id')
  getOne(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getForBuyer(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/confirm')
  confirm(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.confirmOrder(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/reject')
  reject(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.rejectOrder(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/ship')
  ship(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.markShipped(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/deliver')
  deliver(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.markDelivered(current.userId, id);
  }