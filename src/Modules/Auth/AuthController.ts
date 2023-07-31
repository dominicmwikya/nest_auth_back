
import { AuthService } from "./AuthService";
import { Body, Post, Controller, HttpCode, HttpStatus, UseGuards, Get, Request } from "@nestjs/common";
import {signInDTO} from './siginInDTO';
import { AuthGuard } from "./authGuard";
import { Roles } from "./role.decorator";
import { Role } from "./role.enum";
import { roleGuard } from "./rolesGuards";
@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService){}
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() data: signInDTO ){
           return this.authService.Signin(data.username, data.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }

    // @UseGuards(roleGuard)
    @UseGuards(AuthGuard)
    @Post('admin')
    @Roles(Role.Admin)
    @UseGuards(roleGuard)
    getProducts(@Body() data:signInDTO){
      return {
        name: data.username
      }
    }
}