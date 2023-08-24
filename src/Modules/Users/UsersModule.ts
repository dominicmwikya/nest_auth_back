import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/Entities/User.entity';
import { AuthModule } from '../Auth/AuthModule';
import { EmailModule } from '../Email/Email.Module';
import { EmailService } from '../Email/email.service';
import { UsersService } from './UserService';
import { UsersController } from './UsersController';
@Module({
  imports: [forwardRef(() => AuthModule), EmailModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, EmailService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
