import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Bcryptpassword {
	private rounds = 10;
	private salt: string;
	async generateSaltRounds() {
		this.salt = await bcrypt.genSalt(this.rounds);
	}

	async hashPassword<T>(password: T): Promise<string> {
		if (!this.salt) {
			await this.generateSaltRounds();
		}
		const hash = await bcrypt.hash(password.toString(), this.salt);
		return hash;
	}

	async comparePasswords<T>(userpass: T, db_pass: string): Promise<boolean> {
		const isMatch = await bcrypt.compare(userpass.toString(), db_pass);
		return isMatch;
	}
}
