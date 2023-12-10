import helmet from 'helmet';
import { type Application, type Request, type Response, type NextFunction } from 'express';
import blobsRouter from './blobs';
import manifestsRouter from './manifests';
import referrersRouter from './referrers';
import tagsRouter from './tags';
import errorResponse from './errorfactory';

const nameValidator = (request: Request, res: Response, next: NextFunction) => {
  if (!request.params.name?.match(/^[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*(\/[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*)*$/)) {
    res.status(400).json(errorResponse('NAME_INVALID'));
    return;
  }

  next();
};

export default function (app: Application, repository: Repository) {
  app.use(helmet());
  app.route('/v2').get(async (request, res) => {
    res.status(200).end();
  });

  app.use('/v2/:name(*)/blobs', nameValidator, blobsRouter(repository));
  app.use('/v2/:name(*)/manifests', nameValidator, manifestsRouter(repository));
  app.use('/v2/:name(*)/referrers', nameValidator, referrersRouter(repository));
  app.use('/v2/:name(*)/tags', nameValidator, tagsRouter(repository));
}
