import { mkdirSync } from 'fs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const uploadDir = './uploads/products';
mkdirSync(uploadDir, { recursive: true });

interface UploadedImage {
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
}

const imageUpload = {
  dest: uploadDir,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: UploadedImage, cb: Function) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadRequestException('Only image files are allowed.'), false);
      return;
    }
    cb(null, true);
  },
};

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.SELLER)
  @Post()
  create(@CurrentUser() current: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(current.userId, dto);
  }

  @Public()
  @Get()
  findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles(UserRole.SELLER)
  @Patch(':id')
  update(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(current.userId, id, dto);
  }

  @Roles(UserRole.SELLER)
  @Delete(':id')
  remove(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(current.userId, id);
  }

  @Roles(UserRole.SELLER)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image', imageUpload))
  uploadImage(
    @CurrentUser() current: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedImage,
  ) {
    return this.productsService.addImage(current.userId, id, file);
  }
}