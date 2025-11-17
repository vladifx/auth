import pkg from 'pg';
import { env } from "../../config/env.js"

const { Pool } = pkg;

const pool = new Pool({
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE,
})

export async function initDB() {
    try {
        await pool.query('SELECT 1');
        console.info("Postgres connected");
    } catch (e) {
        console.error("Failed to connect to Postgres: ", e.message);
    }
}

export default pool;