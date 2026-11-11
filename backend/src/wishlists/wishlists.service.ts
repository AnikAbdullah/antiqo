import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlists: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async add(userId: number, productId: number) {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const existing = await this.wishlists.findOne({
      where: { userId, productId },
    });
    if (existing) {
      return existing;
    }
    const entry = this.wishlists.create({ userId, productId });
    return this.wishlists.save(entry);
  }

  list(userId: number) {
    return this.wishlists.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: number, productId: number) {
    const entry = await this.wishlists.findOne({
      where: { userId, productId },
    });
    if (!entry) {
      throw new NotFoundException('This product is not in your wishlist.');
    }
    await this.wishlists.remove(entry);
    return { removed: true };
  }
}
