import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const taken = await this.categories.findOne({ where: { name: dto.name } });
    if (taken) {
      throw new ConflictException('A category with this name already exists.');
    }
    const category = this.categories.create({ name: dto.name });
    return this.categories.save(category);
  }

  findAll() {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.name !== undefined) {
      const taken = await this.categories.findOne({
        where: { name: dto.name, id: Not(id) },
      });
      if (taken) {
        throw new ConflictException('A category with this name already exists.');
      }
      category.name = dto.name;
    }
    return this.categories.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categories.remove(category);
    return { deleted: true };
  }
}
