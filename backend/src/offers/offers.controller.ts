import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { OffersService } from './offers.service';
import { SubmitOfferDto } from './dto/submit-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Roles(UserRole.BUYER)
  @Post()
  submit(@CurrentUser() current: AuthUser, @Body() dto: SubmitOfferDto) {
    return this.offersService.submit(current.userId, dto);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/accept')
  accept(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.offersService.accept(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id/reject')
  reject(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.offersService.reject(current.userId, id);
  }

  @Roles(UserRole.BUYER)
  @Patch(':id/use')
  use(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.offersService.use(current.userId, id);
  }
}
