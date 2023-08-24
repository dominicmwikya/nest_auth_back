import { Injectable } from '@nestjs/common';
import nodemailer, { SentMessageInfo, TestAccount } from "nodemailer";
import { mailOptions } from "./MailOptions";
@Injectable()
export class SendMailService {
    private testAccount: TestAccount | null = null;

    private async createTestAccount(): Promise<TestAccount> {
        return await nodemailer.createTestAccount();
    }

    private async createTransport() {
        if (!this.testAccount) {
            this.testAccount = await this.createTestAccount();
        }
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: "dominicmwikya50@gmail.com",
                pass: "opoxgjcezvnlhrfi",
            },
        });
    }

    private mailOptions(to: string, subject: string, html: any): mailOptions {
        if (!this.testAccount) {
            throw new Error("Test account not initialized");
        }
        return {
            from: "dominicmwikya50@gmail.com",
            to: to,
            subject: subject,
            html: html,
        };
    }

    public async sendEmail(to: string, subject: string, body: string) {
        const transport = await this.createTransport();
        try {
            const info: SentMessageInfo = await transport.sendMail(this.mailOptions(to, subject, body));
            console.log(`Email sent: ${info.response}`);
        } catch (error) {
            console.log(error);
        }
    }
}
