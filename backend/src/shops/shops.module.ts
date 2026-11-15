import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User, Product])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
