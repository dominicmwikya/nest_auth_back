import { Module } from "@nestjs/common";
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from "../Users/UsersModule";
import { AuthController } from "./AuthController";
import { AuthService } from "./AuthService";
import { Bcryptpassword } from "./Utils/bycrpt.util";
import { AuthGuard } from "./authGuard";
import { jwtConstants } from "./constants";
@Module({
    imports: [UsersModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '10h' }
        })
    ],
    providers: [AuthService, Bcryptpassword, AuthGuard],
    controllers: [AuthController],
    exports: [AuthService, Bcryptpassword]
})
export class AuthModule { }