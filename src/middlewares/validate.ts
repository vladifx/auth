import { ZodTypeAny } from "zod";
import ApiError from "../exceptions/apiError"
import { FastifyReply, FastifyRequest } from "fastify";

type Schemas = {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}

export default function validate(schemas: Schemas) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        if (schemas.body) {
            const result = schemas.body.safeParse(request.body);
            if (!result.success) {
                throw ApiError.fromZod(result.error);
            }
            request.body = result.data;
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(request.query);
            if (!result.success) {
                throw ApiError.fromZod(result.error);
            }
            request.query = result.data;
        }

        if (schemas.params) {
            const result = schemas.params.safeParse(request.params);
            if (!result.success) {
                throw ApiError.fromZod(result.error);
            }
            request.params = result.data;
        }
    }
}