import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../Users/UserService";
import { Bcryptpassword } from "./Utils/bycrpt.util";
@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private bcrpt: Bcryptpassword
    ) { }

    async Signin(email: string, pass: string): Promise<any> {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new HttpException(
                { error: 'Wrong Username' },
                HttpStatus.UNAUTHORIZED,
            );
        }
        const passwordMatch = await this.bcrpt.comparePasswords(pass, user.password);
        if (!passwordMatch) {
            throw new HttpException(
                { error: 'Wrong Password or username' },
                HttpStatus.UNAUTHORIZED,
            );
        }
        const payload = { id: user.id, name: user.username, email: user.email };
        return {
            accessToken: await this.jwtService.signAsync(payload),
            role: user.role,
            email: user.email,
            userId: user.id,
            authState: true
        };
    }
}
