import { Module } from '@nestjs/common';
import { UsersService } from './UserService';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
