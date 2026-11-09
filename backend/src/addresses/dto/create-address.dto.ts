import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  recipientName: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city: string;

  @IsString()
  @MinLength(3)
  @MaxLength(12)
  postalCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
