import { IsNumber, Min } from 'class-validator';

export class UpdateDeliveryFeeDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;
}
