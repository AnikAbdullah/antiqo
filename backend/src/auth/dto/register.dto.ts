import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { StrongPassword } from '../../common/validators/strong-password.decorator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @StrongPassword()
  password: string;
}
