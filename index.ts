import express from 'express';
import routes from './routes';
import pinoHttp from 'pino-http';
import logger from './logger';
import MemoryRepository from './repositories/memoryRepository';

const app = express();
app.use(
  pinoHttp({
    logger,
    sync: true
  })
);

routes(app, new MemoryRepository());

app.listen(3000, () => {
  console.log(`oci-marketplace listening on port 3000`);
});
