import { CanActivate, Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
@Injectable()
export class testGuard implements CanActivate{
    constructor(private jwtservice: JwtService){}
    async canActivate(context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();
        const usertoken = this.extractJwtToken(request);

        if(!usertoken){
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtservice.verifyAsync(
                usertoken, {
                    secret:jwtConstants.secret
                }
            );
            request['user'] = payload
        } catch (error) {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractJwtToken(request:Request): string | undefined{
       const [token, type] = request.headers.authorization?.split(' ') ?? [];
       return type == 'bearer' ? token : undefined;
    }
}