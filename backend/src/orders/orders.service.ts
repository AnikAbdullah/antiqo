import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async checkout(buyerId: number) {
    const cart = await this.cartItems.find({
      where: { buyerId },
      relations: { product: true },
    });
    if (cart.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }
    const shopId = cart[0].product.shopId;

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const order = await runner.manager.save(
        runner.manager.create(Order, { buyerId, shopId, total: '0.00' }),
      );

      let total = 0;
      const items: OrderItem[] = [];
      for (const line of cart) {
        const product = await runner.manager.findOne(Product, {
          where: { id: line.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new NotFoundException('A product in your cart no longer exists.');
        }
        if (product.stock < line.quantity) {
          throw new ConflictException(
            `Not enough stock for "${product.title}".`,
          );
        }
        product.stock -= line.quantity;
        await runner.manager.save(product);

        total += Number(product.price) * line.quantity;
        const item = await runner.manager.save(
          runner.manager.create(OrderItem, {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: Number(product.price).toFixed(2),
          }),
        );
        items.push(item);
      }

      const deliveryFee = Number(this.config.get<string>('DELIVERY_FEE') ?? '0');
      order.total = (total + deliveryFee).toFixed(2);
      await runner.manager.save(order);
      await runner.manager.remove(cart);

      await runner.commitTransaction();
      return { ...order, items };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  listForBuyer(buyerId: number) {
    return this.orders.find({
      where: { buyerId },
      relations: { shop: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getForBuyer(buyerId: number, id: number) {
    const order = await this.orders.findOne({
      where: { id, buyerId },
      relations: { shop: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    const items = await this.orderItems.find({
      where: { orderId: order.id },
      relations: { product: true },
    });
    return { ...order, items };
  }

  async confirmOrder(sellerId: number, id: number) {
    const order = await this.findSellerOrder(sellerId, id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only a pending order can be confirmed.');
    }
    order.status = OrderStatus.CONFIRMED;
    return this.orders.save(order);
  }

  async rejectOrder(sellerId: number, id: number) {
    const order = await this.findSellerOrder(sellerId, id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only a pending order can be rejected.');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orders.save(order);
  }

  async markShipped(sellerId: number, id: number) {
    const order = await this.findSellerOrder(sellerId, id);
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only a confirmed order can be shipped.');
    }
    order.status = OrderStatus.SHIPPED;
    return this.orders.save(order);
  }

  async markDelivered(sellerId: number, id: number) {
    const order = await this.findSellerOrder(sellerId, id);
    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('Only a shipped order can be delivered.');
    }
    order.status = OrderStatus.DELIVERED;
    return this.orders.save(order);
  }

  async recordCod(sellerId: number, id: number) {
    const order = await this.findSellerOrder(sellerId, id);
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Cash can only be recorded on a delivered order.',
      );
    }
    if (order.paymentStatus !== PaymentStatus.COD_PENDING) {
      throw new BadRequestException('Payment is already settled for this order.');
    }
    order.paymentStatus = PaymentStatus.COD_COLLECTED;
    return this.orders.save(order);
  }

  private async findSellerOrder(sellerId: number, id: number) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    const shop = await this.shops.findOne({ where: { sellerId } });
    if (!shop || order.shopId !== shop.id) {
      throw new ForbiddenException('This order is not for your shop.');
    }
    return order;
  }
}
