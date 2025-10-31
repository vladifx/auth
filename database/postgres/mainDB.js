import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'postgres',
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