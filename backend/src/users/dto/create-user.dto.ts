import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';
import { StrongPassword } from '../../common/validators/strong-password.decorator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @StrongPassword()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
