import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', err => console.log('Redis error: ', err));

export default redis;