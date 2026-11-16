import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { Return } from './entities/return.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Return, Order, OrderItem, Product, User]),
    MailModule,
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
