
import { AuthService } from "./AuthService";
import { Body, Post, Controller, HttpCode, HttpStatus, UseGuards, Get, Request, Res, HttpException } from "@nestjs/common";
import { signInDTO } from './siginInDTO';
import { AuthGuard } from "./authGuard";
import { Roles } from "./role.decorator";
import { Role } from "./role.enum";
import { roleGuard } from "./rolesGuards";
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async signIn(@Body() data: signInDTO, @Res() response) {
    try {
      const result = await this.authService.Signin(data.email, data.password);
      response.status(HttpStatus.OK).json(result);
    } catch (error) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        error: error,
      }); // Send a generic error response for failed login
    }
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
  getProducts(@Body() data: signInDTO) {
    return {
      name: data.email
    }
  }
}