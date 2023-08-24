import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/Entities/User.entity";


@Injectable()
export class EmailService {
    constructor(private mailService: MailerService) { }

    async SendUserEmail(user: UserEntity, token: string) {
        try {
            const response = await this.mailService.sendMail({
                to: user.email,
                from: process.env.SMTP_USERNAME, // Update with your actual sender email
                subject: "Welcome to our App",
                html: `Welcome ${user.email}! Click this link to activate your account http://localhost:3001/shop/user/account-activation/${token}`,
            });
            return response;
        } catch (error) {
            console.error('Error Sending Email:', error);
            throw error;
        }
    }

}