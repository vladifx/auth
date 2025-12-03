import ApiError from '../exceptions/apiError';
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export default function(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.error("ERROR: ",error);

    if (error instanceof ZodError) {
        const apiError = ApiError.fromZod(error);

        return reply
            .status(apiError.status)
            .send({
                message: apiError.message,
                errors: apiError.errors
            });
    }

    if (error instanceof ApiError) {
        return reply
            .status(error.status)
            .send({
                message: error.message,
                errors: error.errors
            });
    }

    return reply
        .status(500)
        .send({ message: "Internal Server Error" });
}