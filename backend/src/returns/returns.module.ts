import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from './entities/return.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Return])],
})
export class ReturnsModule {}
