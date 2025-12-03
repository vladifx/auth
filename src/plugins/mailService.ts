import fp from "fastify-plugin";
import { MailService } from "../services/mailService";

export default fp(async (app) => {
    const mailService = new MailService();
    app.decorate("mailService", mailService);
})