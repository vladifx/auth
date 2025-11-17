import ApiError from '../exceptions/apiError.js'

export default function(error, request, reply) {
    console.log(error);

    if (error instanceof ApiError) {
        return reply.code(error.status).send({ message: error.message, errors: error.errors });
    }

    return reply.code(500).send({ message: 'Unexpected error' })
}