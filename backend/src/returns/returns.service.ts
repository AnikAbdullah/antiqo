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
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { ReturnStatus } from '../common/enums/return-status.enum';
import { MailService } from '../mail/mail.service';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Return } from './entities/return.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { RecordRefundDto } from './dto/record-refund.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returns: Repository<Return>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly mail: MailService,
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

  async inspect(id: number, dto: InspectReturnDto) {
    const record = await this.returns.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Return not found.');
    }
    if (record.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException(
        'Only a requested return can be inspected.',
      );
    }
    record.status = ReturnStatus.INSPECTED;
    record.resaleFit = dto.resaleFit;
    const saved = await this.returns.save(record);
    await this.notifyBuyer(saved.orderId, saved.id, saved.status);
    return saved;
  }

  async recordRefund(id: number, dto: RecordRefundDto) {
    const record = await this.returns.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Return not found.');
    }
    if (record.status !== ReturnStatus.INSPECTED) {
      throw new BadRequestException('Refund requires an inspected return.');
    }
    const order = await this.orders.findOne({ where: { id: record.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.paymentStatus !== PaymentStatus.COD_COLLECTED) {
      throw new BadRequestException(
        'Refund requires COD to be collected first.',
      );
    }
    if (record.resaleFit) {
      const items = await this.orderItems.find({
        where: { orderId: order.id },
      });
      for (const item of items) {
        const product = await this.products.findOne({
          where: { id: item.productId },
        });
        if (product) {
          product.stock += item.quantity;
          await this.products.save(product);
        }
      }
    }

    record.refundAmount = dto.amount.toFixed(2);
    record.status = ReturnStatus.REFUNDED;
    order.paymentStatus = PaymentStatus.REFUNDED;
    await this.orders.save(order);
    const saved = await this.returns.save(record);
    await this.notifyBuyer(saved.orderId, saved.id, saved.status);
    return saved;
  }

  private async notifyBuyer(orderId: number, returnId: number, status: string) {
    const order = await this.orders.findOne({ where: { id: orderId } });
    if (!order) {
      return;
    }
    const buyer = await this.users.findOne({ where: { id: order.buyerId } });
    if (buyer) {
      await this.mail.sendReturnUpdate(buyer.email, returnId, status);
    }
  }
}
