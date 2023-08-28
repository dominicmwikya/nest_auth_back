import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/Entities/User.entity';
import { Repository } from 'typeorm';
import { Bcryptpassword } from '../Auth/Utils/bycrpt.util';
import { EmailService } from '../Email/email.service';

@Injectable()
export class UsersService {
	constructor(
		private bycrptpassword: Bcryptpassword,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private emailService: EmailService,
	) { }


	async findOneByEmail(email: string) {
		return await this.userRepository.findOne({ where: { email: email } });
	}
	async findOne(id: number) {
		try {
			const result = await this.userRepository.findOne({ where: { id: id } });
			if (result instanceof HttpException) {
				throw result;
			}
			return result;

		} catch (error) {
			throw error;
		}
	}

	async createUser(user: UserEntity) {
		const { role, username, email, status, phone, password } = user;
		try {
			const existingUser = await this.findOneByEmail(email);
			if (existingUser) {
				return {
					error: `${existingUser.email} already exists! Choose a different email.`,
				};
			}

			const hashedPassword = await this.bycrptpassword.hashPassword(password);
			const uniquestring = this.generateRandomString();
			user.password = hashedPassword;
			user.code = uniquestring;
			user.status = status;
			user.email = email;
			user.phone = phone;
			user.username = username;
			user.role = role;

			const newUser = await this.userRepository.save(user);

			try {
				await this.emailService.SendUserEmail(newUser, uniquestring);
				return {
					message: "Email Send successfully"
				}
			} catch (error) {
				return {
					error: `Error sending welcome email:, ${error.message}`
				}
				// Continue execution even if the email sending fails
			}

			return newUser;
		} catch (error) {
			throw new HttpException({ error: "SERVER ERROR." }, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private generateRandomString(): string {
		return Math.random().toString(36).slice(2, 9);
	}

	async deleteUser(id: number): Promise<void> {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		await this.userRepository.delete(id);
	}

	async updateUserRecord(id: number, data: UserEntity) {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException('User not Found');
		}
		const { role, email, phone, username, status } = data
		user.username = username;
		user.email = email;
		user.role = role;
		user.phone = phone;
		user.status = status;
		await this.userRepository.save(user);
	}

	async findAll() {
		return this.userRepository.find();
	}
}
