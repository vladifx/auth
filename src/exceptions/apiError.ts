import { ZodError } from "zod";

export type ValidationErrorItem = {
    field: string;
    message: string;
};

export interface ApiErrorOptions {
    status: number;
    message: string;
    errors?: ValidationErrorItem[];
}

export default class ApiError extends Error {
    public status: number;
    public errors?: ValidationErrorItem[];

    constructor({ status, message, errors }: ApiErrorOptions) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static BadRequest(message = "Bad request", errors?: ValidationErrorItem[]) {
        return new ApiError({
            status: 400,
            message: message,
            errors: errors,
        });
    }

    static UnauthorizedError(message = "User is not authorized") {
        return new ApiError({
            status: 401,
            message: message,
        });
    }

    static Forbidden(message = "Forbidden") {
        return new ApiError({
            status: 403,
            message: message,
        })
    }

    static NotFound(message = "Not Found") {
        return new ApiError({
            status: 404,
            message: message,
        });
    }

    static Internal(message = "Internal server error") {
        return new ApiError({
            status: 500,
            message,
        });
    }

    static fromZod(error: ZodError) {
        const errors: ValidationErrorItem[] = error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
        }));
        return ApiError.BadRequest("Validation error", errors);
    }
}