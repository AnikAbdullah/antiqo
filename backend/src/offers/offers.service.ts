import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferStatus } from '../common/enums/offer-status.enum';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Offer } from './entities/offer.entity';
import { SubmitOfferDto } from './dto/submit-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offers: Repository<Offer>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
  ) {}

  async submit(buyerId: number, dto: SubmitOfferDto) {
    const product = await this.products.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const offer = this.offers.create({
      buyerId,
      productId: dto.productId,
      quantity: dto.quantity,
      price: dto.price.toFixed(2),
    });
    return this.offers.save(offer);
  }

  async accept(sellerId: number, id: number) {
    const offer = await this.findSellerOffer(sellerId, id);
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only a pending offer can be accepted.');
    }
    offer.status = OfferStatus.ACCEPTED;
    return this.offers.save(offer);
  }

  async reject(sellerId: number, id: number) {
    const offer = await this.findSellerOffer(sellerId, id);
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Only a pending offer can be rejected.');
    }
    offer.status = OfferStatus.REJECTED;
    return this.offers.save(offer);
  }

  private async findSellerOffer(sellerId: number, id: number) {
    const offer = await this.offers.findOne({
      where: { id },
      relations: { product: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found.');
    }
    const shop = await this.shops.findOne({ where: { sellerId } });
    if (!shop || offer.product.shopId !== shop.id) {
      throw new ForbiddenException('This offer is not for your shop.');
    }
    return offer;
  }
}
