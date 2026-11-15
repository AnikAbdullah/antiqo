import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductCondition } from '../../common/enums/product-condition.enum';

export class CreateProductDto {
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsEnum(ProductCondition)
  condition: ProductCondition;
}
