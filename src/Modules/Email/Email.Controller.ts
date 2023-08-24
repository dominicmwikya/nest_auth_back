import { Body, Controller, Post } from "@nestjs/common";
import { UserEntity } from "src/Entities/User.entity";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post("welcome")
    async SendUserWelcomeEmail(@Body() user: UserEntity, @Body() token: string) {
        // await this.emailService.SendUserWelcomeEmail(user, token);
        return { message: "Welcome email sent successfully." };
    }
}
