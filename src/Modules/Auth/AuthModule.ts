import { Module } from "@nestjs/common";
import { AuthService } from "./AuthService";
import { AuthController } from "./AuthController";
import { UsersModule } from "../Users/UsersModule";
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from "./constants";
import { AuthGuard } from "./authGuard";
import { roleGuard } from "./rolesGuards";
import { Bcryptpassword } from "./Utils/bycrpt.util";
@Module({
    imports: [UsersModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '10h' }
        })
    ],
    providers: [AuthService, Bcryptpassword, AuthGuard, roleGuard],
    controllers: [AuthController],
    exports: [AuthService, Bcryptpassword]
})
export class AuthModule { }