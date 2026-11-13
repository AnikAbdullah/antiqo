import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reports: Repository<Report>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async create(reporterId: number, dto: CreateReportDto) {
    const product = await this.products.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const report = this.reports.create({
      reporterId,
      productId: dto.productId,
      reason: dto.reason,
    });
    return this.reports.save(report);
  }
}
