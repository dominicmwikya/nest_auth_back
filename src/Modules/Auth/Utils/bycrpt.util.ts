import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Bcryptpassword {
    private rounds = 10;
    private salt: string;

    constructor() {}
    
    async generateSaltRounds() {
        this.salt = await bcrypt.genSalt(this.rounds);
    }

    async hashPassword(password:string) {
        if (!this.salt) {
            await this.generateSaltRounds();
        }
        const hash = await bcrypt.hash(password, this.salt);
        return hash;
    }

    async comparePasswords(userpass:string, db_pass:string) {
        const isMatch = await bcrypt.compare(userpass, db_pass);
        return isMatch;
    }
}
