import Fastify from "fastify";
import 'dotenv/config';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import { initDB } from './database/postgres/mainDB.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 5000;
const fastify = new Fastify({ logger: true });

fastify.register(authRoute, { prefix: '/auth' });
fastify.register(userRoute, { prefix: '/user' });
fastify.setErrorHandler(errorMiddleware);

const start = async () => {
    try {
        await initDB();
        await fastify.listen({ port: PORT, host: '0.0.0.0'});
        console.info(`Server started on port: ${PORT}`)
    } catch(err) {
      console.log(err);
      process.exit(1);
    }
}

start();