import { IsInt, Min } from 'class-validator';

export class CreateReturnDto {
  @IsInt()
  @Min(1)
  orderId: number;
}
