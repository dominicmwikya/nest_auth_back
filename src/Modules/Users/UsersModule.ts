import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './UserService';
import { AuthModule } from '../Auth/AuthModule';
import { UsersController } from './UsersController';
import { UserEntity } from 'src/Entities/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports:[forwardRef(()=>AuthModule), TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  controllers:[UsersController],
  exports: [UsersService],
})
export class UsersModule {}
