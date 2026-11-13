import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { ProductStatus } from '../common/enums/product-status.enum';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly productImages: Repository<ProductImage>,
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

  async findAll(filters: {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Product>> {
    const where: FindOptionsWhere<Product> = {
      status: ProductStatus.ACTIVE,
    };
    if (filters.search) {
      where.title = ILike(`%${filters.search}%`);
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    const { minPrice, maxPrice } = filters;
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice.toFixed(2), maxPrice.toFixed(2));
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice.toFixed(2));
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice.toFixed(2));
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = Math.min(filters.limit && filters.limit > 0 ? filters.limit : 12, 50);

    const [items, total] = await this.products.findAndCount({
      where,
      relations: { shop: true, category: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const product = await this.products.findOne({
      where: { id },
      relations: { shop: true, category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  async update(sellerId: number, id: number, dto: UpdateProductDto) {
    const product = await this.findOwned(sellerId, id);
    if (dto.categoryId !== undefined) {
      const category = await this.categories.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found.');
      }
      product.categoryId = dto.categoryId;
    }
    if (dto.title !== undefined) {
      product.title = dto.title;
    }
    if (dto.price !== undefined) {
      product.price = dto.price.toFixed(2);
    }
    if (dto.stock !== undefined) {
      product.stock = dto.stock;
    }
    if (dto.condition !== undefined) {
      product.condition = dto.condition;
    }
    return this.products.save(product);
  }

  async remove(sellerId: number, id: number) {
    const product = await this.findOwned(sellerId, id);
    await this.products.remove(product);
    return { deleted: true };
  }

  async addImage(
    sellerId: number,
    productId: number,
    file: { path: string } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No image uploaded.');
    }
    const product = await this.findOwned(sellerId, productId);
    const image = this.productImages.create({
      productId: product.id,
      path: file.path,
    });
    return this.productImages.save(image);
  }

  private async findOwned(sellerId: number, id: number) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const shop = await this.shops.findOne({ where: { sellerId } });
    if (!shop || product.shopId !== shop.id) {
      throw new ForbiddenException('This product is not yours.');
    }
    return product;
  }
}
