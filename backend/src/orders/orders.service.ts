import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartItems: Repository<CartItem>,
    private readonly dataSource: DataSource,
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

      order.total = total.toFixed(2);
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
}