import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { Return } from './entities/return.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Return, Order])],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
