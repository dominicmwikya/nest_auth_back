// users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Bcryptpassword } from '../Auth/Utils/bycrpt.util';
import { UserEntity } from 'src/Entities/User.entity';

@Injectable()
export class UsersService {
  constructor(
    private bycrptpassword: Bcryptpassword,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findOne(username: string) {
    return this.userRepository.findOne({where:{username:username}});
  }

  async createUser(username: string, password: string, role: string) {
    const hashedpassword = await this.bycrptpassword.hashPassword(password);
    const newUser = this.userRepository.create({
      username,
      password: hashedpassword,
      role,
    });
    return this.userRepository.save(newUser);
  }

  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({where:{userId:id}});

    if (!user) {
      // User not found in the database
      throw new NotFoundException('User not found');
    }
      await this.userRepository.delete(id);
  }

  async updateUserRecord(id: number, data:UserEntity){
    const user = await this.userRepository.findOne({where:{userId:id}})
    if(!user){
      throw new NotFoundException('User not Found');
    }
    //update only the username
    user.username = data.username;
    user.role = data.role;
    //save the updated user;
    await this.userRepository.save(user);
  }
}
