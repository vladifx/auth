import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const SYSTEM_DB = 'postgres';
const TARGET_DB = process.env.PG_DATABASE;

console.log('PG_PASSWORD:', process.env.PG_PASSWORD);

const systemPool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: SYSTEM_DB,
});

async function setupDatabase() {
    try {
        const checkExistence = await systemPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [TARGET_DB]
        );

        if (checkExistence.rowCount === 0) {
            await systemPool.query(`CREATE DATABASE ${TARGET_DB}`);
            console.log(`Database "${TARGET_DB}" created`);
        } else {
            console.log(`Database "${TARGET_DB}" already exists`);
        }

        const appPool = new Pool({
            ...systemPool.options,
            database: TARGET_DB,
        });

        await appPool.query('SELECT 1');
        console.log(`Connected to database "${TARGET_DB}"`);

        await appPool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Table "users" is ready');

        await appPool.end();
        await systemPool.end();
    } catch (e) {
        console.error('Database setup failed:', e.message);
        process.exit(1);
    }
}

setupDatabase();