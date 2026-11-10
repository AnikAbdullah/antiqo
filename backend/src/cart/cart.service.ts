import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { Product } from '../products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async add(buyerId: number, dto: AddCartItemDto) {
    const product = await this.products.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('This product is not available.');
    }
    const existing = await this.cartItems.findOne({
      where: { buyerId, productId: dto.productId },
    });
    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartItems.save(existing);
    }
    const item = this.cartItems.create({
      buyerId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    return this.cartItems.save(item);
  }
}
