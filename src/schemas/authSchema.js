export default {
    register: {
        body: {
            type: "object",
            required: ["username", "password"],
            properties: {
                username: { type: 'string', minLength: 4, maxLength: 20 },
                password: { type: 'string', minLength: 6, maxLength: 32 },
            }
        }
    },

    login: {
        body: {
            type: "object",
            required: ["username", "password"],
            properties: {
                username: { type: 'string' },
                password: { type: 'string' },
            }
        }
    },

    refreshToken: {
        body: {
            type: "object",
            required: ["refreshToken"],
            properties: {
                refreshToken: { type: 'string' },
            }
        }
    }

}