import { Post,Get, Controller, Body, Delete, Param, NotFoundException, InternalServerErrorException, Put } from "@nestjs/common";
import { UsersService } from "./UserService";
import { signInDTO } from "../Auth/siginInDTO";
import { UserEntity } from "src/Entities/User.entity";


@Controller('users')

export class UsersController{
 constructor(private userService:UsersService){}

 @Post('/create')
    async createUser(@Body() data:{username:string, password:string, role:string}){
       const { username, password, role} = data;
       const newUser = await this.userService.createUser(username,password, role);

       return newUser;
    }
 @Get()
 async getUsers(){
    const users = await this.userService.findAllUsers();
    return users;
 }

 @Delete('/:id')
    async deleteUser(@Param('id') id:number){
      try {
        await this.userService.deleteUser(id);
        return { message: 'User deleted successfully' };
      } catch (error) {
        if (error instanceof NotFoundException) {
            throw error;
          } else {
            throw new InternalServerErrorException('Failed to delete user');
          }
      }
    }

    @Put('/:id')
    async updateUser(@Param('id') id: number,@Body() data:UserEntity){
        try {
              await this.userService.updateUserRecord(id, data);
              return {message: `${id}  updated successfully`}
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error;
            } else{
                throw new Error(error.message)
            }
        }
    }
}