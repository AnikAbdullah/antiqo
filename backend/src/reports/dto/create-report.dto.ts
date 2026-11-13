import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;
}
