import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../Users/UserService";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService{
    constructor(
        private userService:UsersService,
        private jwtService: JwtService
        ){}

    async Signin(username:string, pass:string):Promise<any>{
        const user = await this.userService.findOne(username);

        if (user?.password !== pass){
            throw new UnauthorizedException();
        }
        //generate JWT TOKEN HERE AND RETURN IT 
        const payload = { id:user.userId}
        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }
}