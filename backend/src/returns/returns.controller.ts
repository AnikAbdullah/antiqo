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
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { RecordRefundDto } from './dto/record-refund.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.returnsService.findAll();
  }

  @Roles(UserRole.BUYER)
  @Post()
  create(@CurrentUser() current: AuthUser, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(current.userId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/inspect')
  inspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InspectReturnDto,
  ) {
    return this.returnsService.inspect(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/refund')
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordRefundDto,
  ) {
    return this.returnsService.recordRefund(id, dto);
  }
}
