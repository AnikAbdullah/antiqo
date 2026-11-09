import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/authenticated-request.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
}
