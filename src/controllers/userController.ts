import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ChangePasswordRequest } from "../schemas/user";

export function userController (app: FastifyInstance) {
    return {
        authorizationUser: async (
            request: FastifyRequest,
            reply: FastifyReply
        )=> {
            const user = await app.userService.getUserProfile(request.user.userId);

            return reply.code(200).send(user);
        },

        changedPassword: async (
            request: FastifyRequest<{ Body: ChangePasswordRequest }>,
            reply: FastifyReply
        )=> {
            const { oldPassword, newPassword } = request.body;

            await app.userService.changePassword(
                request.user.userId,
                oldPassword,
                newPassword
            );

            return reply.send({
                message: "Password changed successfully"
            })
        },
    }
}