import authController from '../controllers/authController.js';
import AuthSchema from "../schemas/authSchema.js";
import validate from "../middlewares/validate.js"

export default async function authRoute(fastify, options) {

    fastify.post('/registration', { preHandler: validate(AuthSchema.register) }, authController.registration);
    fastify.post('/login', { preHandler: validate(AuthSchema.login) }, authController.login);
    fastify.post('/refresh', { preHandler: validate(AuthSchema.refreshToken) }, authController.refresh);
    fastify.post('/logout', { preHandler: validate(AuthSchema.refreshToken) }, authController.logout);

}