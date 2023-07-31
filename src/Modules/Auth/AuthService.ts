import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../Users/UserService";
import { JwtService } from "@nestjs/jwt";
import { Bcryptpassword } from "./Utils/bycrpt.util";
@Injectable()
export class AuthService{
    constructor(
        private userService:UsersService,
        private jwtService: JwtService,
        private bcrpt: Bcryptpassword
        ){}

    async Signin(username:string, pass:string):Promise<any>{
        const user = await this.userService.findOne(username);
        if(!user){
            throw new UnauthorizedException("Invalid username or email");
        }
        const passwordMatch =  this.bcrpt.comparePasswords(pass, user.password);
        
        if (!passwordMatch){
            throw new UnauthorizedException("wrong password");
        }
        const payload = { id:user.userId, name:user.username}
        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }
}