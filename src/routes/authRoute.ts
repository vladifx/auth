import { authController } from "../controllers/authController.js";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    RegisterSchema, LoginSchema, RefreshTokenSchema, AuthResponseSchema,
    RefreshResponseSchema, RegistrationResponseSchema, ResendActivationSchema,
    ForgotPasswordSchema, ResetPasswordSchema, ResetPasswordParamsSchema, ActivateParamsSchema,
} from "../schemas/auth";

export default async function authRoute(
    app: FastifyInstance,
    options: FastifyPluginOptions
) {
    const controller = authController(app);

    app.post(
        "/registration",
        {
            config: {
                rateLimit: {
                    max: 3,
                    timeWindow: "30 seconds",
                }
            },
            schema: {
                body: RegisterSchema,
                response: {
                    201: RegistrationResponseSchema
                }
            },
        },
        controller.registration
    );

    app.post(
        "/login",
        {
            config: {
                rateLimit: {
                    max: 15,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: LoginSchema,
                response: {
                    200: AuthResponseSchema,
                },
            },
        },
        controller.login
    );

    app.post(
        "/refresh",
        {
            config: {
                rateLimit: {
                    max: 20,
                    timeWindow: "5 minutes",
                },
            },
            schema: {
                body: RefreshTokenSchema,
                response: {
                    200: RefreshResponseSchema,
                },
            },
        },
        controller.refresh
    );

    app.post(
        "/logout",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: RefreshTokenSchema,
            },
        },
        controller.logout
    );

    app.post(
        "/logout-all",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: RefreshTokenSchema,
            },
        },
        controller.logoutFromAll
    );

    app.get(
        "/activate/:token",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                params: ActivateParamsSchema,
            }
        },
        controller.activate
    )

    app.post(
        "/resend-activation",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: ResendActivationSchema
            }
        },
        controller.resendActivation
    )

    app.post(
        "/forgot-password",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                body: ForgotPasswordSchema
            }
        },
    controller.forgotPassword
    )

    app.post(
        "/reset-password/:token",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "10 minutes",
                },
            },
            schema: {
                params: ResetPasswordParamsSchema,
                body: ResetPasswordSchema,
            }
        },
        controller.resetPassword
    );
}