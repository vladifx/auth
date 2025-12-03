import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    RegisterRequest, LoginRequest, RefreshTokenRequest, ResendActivationRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordParamsRequest,
    ActivateParamsRequest
} from "../schemas/auth";
import ApiError from "../exceptions/apiError";

export function authController(app: FastifyInstance) {
    return {
        registration: async (
            request: FastifyRequest<{ Body: RegisterRequest }>,
            reply: FastifyReply
        ) => {
            const { username, email, password } = request.body;

            await app.authService.registration(
                username,
                email,
                password
            );

            return reply.code(201).send({
                message: "Registration successful. Check your email to activate account."
            });
        },

        login: async (
            request: FastifyRequest<{ Body: LoginRequest }>,
            reply: FastifyReply
        ) => {
            const { email, password } = request.body;

            const userData = await app.authService.login(email, password);

            return reply.send(userData);
        },

        refresh: async (
            request: FastifyRequest<{ Body: RefreshTokenRequest }>,
            reply: FastifyReply
        ) => {
            const { refreshToken } = request.body;

            const refreshedTokens = await app.authService.refresh(refreshToken);

            return reply.send(refreshedTokens);
        },

        logout: async (
            request: FastifyRequest<{ Body: RefreshTokenRequest }>,
            reply: FastifyReply
        ) => {
            const { refreshToken } = request.body;

            await app.authService.logout(refreshToken);

            return reply.code(204).send();
        },

        logoutFromAll: async (
            request: FastifyRequest<{ Body: RefreshTokenRequest }>,
            reply: FastifyReply
        )=> {
            const { refreshToken } = request.body;

            await app.authService.logoutFromAllDevice(refreshToken);

            return reply.code(204).send();
        },

        activate: async (
            request: FastifyRequest<{ Params: ActivateParamsRequest}>,
            reply: FastifyReply
        )=> {
            const { token } = request.params;
            if (!token) throw ApiError.BadRequest("Token missing");

            await app.authService.activateEmail(token);

            return reply.send({
                message: "Your account has been activated"
            });
        },

        resendActivation: async (
            request: FastifyRequest<{ Body: ResendActivationRequest }>,
            reply: FastifyReply
        ) => {
            const { email } = request.body;
            if (!email) throw ApiError.BadRequest("Email missing");

            await app.authService.resendActivationLink(email);

            return reply.send({
                message: "We sent you a new activation link. Check your email to activate account."
            });
        },

        forgotPassword: async (
            request: FastifyRequest<{ Body: ForgotPasswordRequest }>,
            reply: FastifyReply
        )=> {
            const { email } = request.body;
            if (!email) throw ApiError.BadRequest("Email missing");

            await app.authService.forgotPassword(email);

            return reply.send({
                message: "Check your email for reset password"
            });
        },

        resetPassword: async (
            request: FastifyRequest<{
                Params: ResetPasswordParamsRequest,
                Body: ResetPasswordRequest
            }>,
            reply: FastifyReply
        )=> {
            const { token } = request.params;
            const { newPassword } = request.body;

            await app.authService.resetPassword(token, newPassword);

            return reply.send({
                message: "Password changed successfully"
            });
        }
    };
}