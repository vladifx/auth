import * as process from "node:process";

class Config {
    static String(key) {
        const value = process.env[key];
        if (typeof value !== "string") {
            throw new Error(`Environment variable ${key} not found or not a string`);
        }

        return value;
    }

    static Number(key) {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} not found`);
        }

        const intValue = parseInt(value, 10);
        if (isNaN(intValue)) {
            throw new Error(`Environment variable ${key} is not a valid integer`);
        }

        return intValue;
    }
}

export default Config;