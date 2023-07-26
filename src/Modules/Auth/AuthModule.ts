import { Module } from "@nestjs/common";
import { AuthService } from "./AuthService";
import { AuthController } from "./AuthController";
import { UsersModule } from "../Users/UsersModule";
import {JwtModule} from '@nestjs/jwt'
import { jwtConstants } from "./constants";

@Module({
    imports:[UsersModule,
        JwtModule.register({
            global:true,
            secret:jwtConstants.secret,
            signOptions:{expiresIn:'60s'}
        })
    ],
    providers:[AuthService],
    controllers:[AuthController]
})
export class AuthModule{}