import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Order } from '../orders/entities/order.entity';
import { Return } from './entities/return.entity';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returns: Repository<Return>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  findAll() {
    return this.returns.find({
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(buyerId: number, dto: CreateReturnDto) {
    const order = await this.orders.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.buyerId !== buyerId) {
      throw new ForbiddenException('This order is not yours.');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('You can only return a delivered order.');
    }
    const existing = await this.returns.findOne({
      where: { orderId: dto.orderId },
    });
    if (existing) {
      throw new ConflictException(
        'A return has already been requested for this order.',
      );
    }
    const request = this.returns.create({ orderId: dto.orderId });
    return this.returns.save(request);
  }
}
