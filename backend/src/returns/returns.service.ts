import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return } from './entities/return.entity';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returns: Repository<Return>,
  ) {}

  findAll() {
    return this.returns.find({
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }
}
