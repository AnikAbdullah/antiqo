import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SettingsService } from './settings.service';
import { UpdateDeliveryFeeDto } from './dto/update-delivery-fee.dto';

@Controller('admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles(UserRole.ADMIN)
  @Get('delivery-fee')
  async getDeliveryFee() {
    return { deliveryFee: await this.settingsService.getDeliveryFee() };
  }

  @Roles(UserRole.ADMIN)
  @Patch('delivery-fee')
  setDeliveryFee(@Body() dto: UpdateDeliveryFeeDto) {
    return this.settingsService.setDeliveryFee(dto.amount);
  }
}
