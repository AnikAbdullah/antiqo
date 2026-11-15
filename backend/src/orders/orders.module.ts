import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, Shop, User]),
    MailModule,
    SettingsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}