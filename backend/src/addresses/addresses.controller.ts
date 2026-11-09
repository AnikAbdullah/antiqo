import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() current: AuthUser) {
    return this.addressesService.listForUser(current.userId);
  }

  @Post()
  add(@CurrentUser() current: AuthUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.addForUser(current.userId, dto);
  }
}
