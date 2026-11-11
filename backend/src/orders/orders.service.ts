import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
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
    const total = cart.reduce(
      (sum, line) => sum + Number(line.product.price) * line.quantity,
      0,
    );
    const order = await this.orders.save(
      this.orders.create({ buyerId, shopId, total: total.toFixed(2) }),
    );
    const items = cart.map((line) =>
      this.orderItems.create({
        orderId: order.id,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: Number(line.product.price).toFixed(2),
      }),
    );
    await this.orderItems.save(items);
    await this.cartItems.remove(cart);
    return { ...order, items };
  }
}
