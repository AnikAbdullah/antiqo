import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async create(sellerId: number, dto: CreateProductDto) {
    const shop = await this.shops.findOne({ where: { sellerId } });
    if (!shop) {
      throw new BadRequestException('You need a shop before adding products.');
    }
    const category = await this.categories.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    const product = this.products.create({
      shopId: shop.id,
      categoryId: dto.categoryId,
      title: dto.title,
      price: dto.price.toFixed(2),
      stock: dto.stock,
      condition: dto.condition,
    });
    return this.products.save(product);
  }
}
