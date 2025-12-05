import fp from "fastify-plugin";
import { MailClient } from "../clients/mailClient";

export default fp(async (app) => {
    const mailClient = new MailClient(app);
    app.decorate("mailClient", mailClient);
});