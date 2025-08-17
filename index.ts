import express from 'express';
import routes from './routes';
import pinoHttp from 'pino-http';
import logger from './logger';
import MemoryRepository from './repositories/memoryRepository';

const app = express();
app.use(pinoHttp({ logger }));

routes(app, new MemoryRepository());

const port = parseInt(process.env.PORT || '3000');

app.listen(port, () => {
  console.log(`oci-marketplace listening on port ${port}`);
});
