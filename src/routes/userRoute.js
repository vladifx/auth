import userController from "../controllers/userController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

export default async function userRoute(fastify, options) {

    fastify.get('/me', { preHandler: [authMiddleware] }, userController.getOneUser);

}