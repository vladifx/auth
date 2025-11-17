import ApiError from "../exceptions/apiError.js";
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export default function validate(schema) {

    const validateFn = ajv.compile(schema.body);

    return async function(request, reply) {
        const valid = validateFn(request.body);
        if (!valid) {
            throw ApiError.BadRequest("Validation failed", validateFn.errors);
        }
    };

}