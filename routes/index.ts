import { type Application } from 'express';
import blobsRouter from './blobs';
import manifestsRouter from './manifests';
import referrersRouter from './referrers';
import tagsRouter from './tags';
import debugRouter from './debug';
import { nameValidator } from './validators';

export default function (app: Application, repository: Repository) {
  app.disable('x-powered-by');

  app.route('/v2').get((request, res) => {
    res.sendStatus(200);
  });

  app.use('/debug', debugRouter(repository));
  app.use('/v2/:name{*splat}/blobs', nameValidator, blobsRouter(repository));
  app.use('/v2/:name{*splat}/manifests', nameValidator, manifestsRouter(repository));
  app.use('/v2/:name{*splat}/referrers', nameValidator, referrersRouter(repository));
  app.use('/v2/:name{*splat}/tags', nameValidator, tagsRouter(repository));

  app.use((request, res) => {
    res.sendStatus(404);
  });
}
