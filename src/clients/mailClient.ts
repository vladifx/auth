import nodemailer, { Transporter } from "nodemailer";
import Config from "../config/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { FastifyInstance } from "fastify";

export class MailClient {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor(app: FastifyInstance) {
        const options: SMTPTransport.Options = {
            host: Config.String("SMTP_HOST"),
            port: Config.Number("SMTP_PORT"),
            secure: false,
            auth: {
                user: Config.String("SMTP_USER"),
                pass: Config.String("SMTP_PASS"),
            }
        };
        this.transporter = nodemailer.createTransport(options);
    }

    async sendActivationLink(email: string, link: string) {
        await this.transporter.sendMail({
            from: Config.String("MAIL_FROM"),
            to: email,
            subject: "Email verification",
            html: `
                <h2>Activate your email</h2>
                <p>Click to activate:</p>
                <a href="${link}">${link}</a>
            `,
        })
    }

    async sendPasswordResetLink(email: string, link: string) {
        await this.transporter.sendMail({
            from: Config.String("MAIL_FROM"),
            to: email,
            subject: "Reset password",
            html: `
            <h2>Password reset</h2>
            <p>Click to change your password:</p>
            <a href="${link}">${link}</a>
        `,
        })
    }
}