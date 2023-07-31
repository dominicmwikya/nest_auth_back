import { Injectable, CanActivate, UnauthorizedException, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "./role.enum";
import { ROLES_KEY } from "./role.decorator";

@Injectable()
export class roleGuard implements CanActivate{
    constructor(private reflector: Reflector){}
    async canActivate(context: ExecutionContext){
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, 
          [
            context.getHandler(), 
            context.getClass()
          ])
          if(!requiredRoles){
            return true;
          }
          const result = context.switchToHttp().getRequest();

            console.log(result)
        //   const { user } = context.switchToHttp().getRequest();
        //   return requiredRoles.some((role)=>user.role?.includes(role)); 

    }
}