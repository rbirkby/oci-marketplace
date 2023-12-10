import helmet from 'helmet';
import { type Application } from 'express';
import blobsRouter from './blobs';
import manifestsRouter from './manifests';
import referrersRouter from './referrers';
import tagsRouter from './tags';
import { nameValidator } from './validators';

export default function (app: Application, repository: Repository) {
  app.use(helmet());

  app.route('/v2').get((request, res) => {
    res.sendStatus(200);
  });

  app.use('/v2/:name(*)/blobs', nameValidator, blobsRouter(repository));
  app.use('/v2/:name(*)/manifests', nameValidator, manifestsRouter(repository));
  app.use('/v2/:name(*)/referrers', nameValidator, referrersRouter(repository));
  app.use('/v2/:name(*)/tags', nameValidator, tagsRouter(repository));

  app.use((request, res) => {
    res.sendStatus(404);
  });
}
