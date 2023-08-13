import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, HttpException, HttpStatus, HttpCode } from "@nestjs/common";
import { UserEntity } from "src/Entities/User.entity";
import { UsersService } from "./UserService";

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService) { }

	@Post('/create')
	async createUser(@Body() user) {
		try {
			await this.userService.createUser(user);
			return {
				message: `User ${user.id} created successfully`
			};
		} catch (error) {
			return error;
		}
	}

	@Get()
	async getUsers() {
		try {
			const users = await this.userService.findAll();
			return {
				data: users,
			}
		} catch (error) {
			return {
				error: "Failed to fetch users"
			}
		}
	}

	@Delete('/:id')
	async deleteUser(@Param('id') id: number) {
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
	async updateUser(@Param('id') id: number, @Body() data: UserEntity) {
		console.log(data)
		try {
			await this.userService.updateUserRecord(id, data);
			return { message: `${id}  updated successfully` }
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			} else {
				throw new Error(error.message)
			}
		}
	}
}