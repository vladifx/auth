import { userController } from "../controllers/userController.js";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { UserProfileSchema } from "../schemas/user";
import { ChangePasswordSchema } from "../schemas/user";

export default async function userRoute(
    app: FastifyInstance,
    options: FastifyPluginOptions
) {
    const controller = userController(app);

    app.get(
        '/me',
        {
            config: {
                rateLimit: {
                    max: 3,
                    timeWindow: "1 minutes",
                }
            },
            preHandler: [
                app.authMiddleware,
            ],
            schema: {
                response: {
                    200: UserProfileSchema,
                }
            }
        },
        controller.getAuthorizationUser
    );

    app.put(
        "/change-password",
        {
            preHandler: [
                app.authMiddleware,
            ],
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: ChangePasswordSchema,
            }
        },
        controller.changeUserPassword
    )
}