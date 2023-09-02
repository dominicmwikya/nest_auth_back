import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) { }
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException("You must log in to access the app services");
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.SECRET_KEY_API_KEY
			});

			const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
				context.getHandler(),
				context.getClass(),
			]);

			if (requiredRoles && !requiredRoles.some(role => payload.roles.includes(role))) {
				throw new UnauthorizedException('You are not authorized to access this resource');
			}

			request['user'] = {
				...payload,
				role: payload.role,
				email: payload.email,
				id: payload.id,

			};
		} catch (error) {
			throw new UnauthorizedException();
		}
		return true;
	}
	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}