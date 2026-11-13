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
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@CurrentUser() current: AuthUser, @Body() dto: CreateReportDto) {
    return this.reportsService.create(current.userId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.resolve(id);
  }
}