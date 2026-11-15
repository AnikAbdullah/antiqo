import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

const DELIVERY_FEE_KEY = 'delivery_fee';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settings: Repository<Setting>,
    private readonly config: ConfigService,
  ) {}

  async getDeliveryFee(): Promise<number> {
    const row = await this.settings.findOne({
      where: { key: DELIVERY_FEE_KEY },
    });
    if (row) {
      return Number(row.value);
    }
    return Number(this.config.get<string>('DELIVERY_FEE') ?? '0');
  }

  async setDeliveryFee(amount: number) {
    await this.settings.save({
      key: DELIVERY_FEE_KEY,
      value: amount.toFixed(2),
    });
    return { deliveryFee: amount };
  }
}
