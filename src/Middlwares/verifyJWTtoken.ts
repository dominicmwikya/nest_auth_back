import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {Decodejwt}  from './decode';
 
@Injectable()
export class verifyJWTtoken implements NestMiddleware {
    constructor(){}
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {

        console.log(token)

     
    } catch (error) {
        console.log(error)
      throw new UnauthorizedException('Invalid token');
    }
  }
}
