import { IsString, MinLength } from 'class-validator';
import { StrongPassword } from '../../common/validators/strong-password.decorator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(10)
  token: string;

  @IsString()
  @StrongPassword()
  newPassword: string;
}
