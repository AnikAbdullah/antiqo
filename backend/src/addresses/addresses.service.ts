import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addresses: Repository<Address>,
  ) {}

  async addForUser(userId: number, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addresses.update({ userId }, { isDefault: false });
    }
    const address = this.addresses.create({ ...dto, userId });
    return this.addresses.save(address);
  }

  listForUser(userId: number) {
    return this.addresses.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }
}
