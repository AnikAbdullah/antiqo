import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() current: AuthUser) {
    return this.usersService.getProfile(current.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() current: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(current.userId, dto);
  }

  @Post('me/email/verify-request')
  requestEmailVerification(@CurrentUser() current: AuthUser) {
    return this.usersService.requestEmailVerification(current.userId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('email/verify')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.usersService.verifyEmail(dto.token);
  }
}
