
import { Body, Controller, Get, HttpStatus, Post, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./AuthService";
import { AuthGuard } from "./authGuard";
import { signInDTO } from './siginInDTO';
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
	@Get('verify-token')
	GetUserTokenVerification(@Request() req: any) {
		if (req.user) {
			return {
				id: req.user.id,
				email: req.user.email,
			}
		}
		return {
			error: "No valid token found! please login"
		}
	}

}