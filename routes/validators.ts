import { type Request, type Response, type NextFunction } from 'express';
import errorResponse from './errorfactory';

export function nameValidator(request: Request, res: Response, next: NextFunction) {
  if (!request.params.name?.match(/^[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*(\/[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*)*$/)) {
    res.status(400).json(errorResponse('NAME_INVALID'));
    return;
  }

  next();
}

export function digestValidator(request: DigestRequest, res: Response, next: NextFunction) {
  if (!request.params.digest?.match(/[a-z0-9]+([+._-][a-z0-9]+)*:[a-zA-Z0-9=_-]+/)) {
    res.status(400).json(errorResponse('DIGEST_INVALID'));
    return;
  }

  next();
}

export function referenceValidator(request: ReferenceRequest, res: Response, next: NextFunction) {
  if (
    !request.params.reference?.match(
      /([a-z0-9]+([+._-][a-z0-9]+)*:[a-zA-Z0-9=_-]+)|([a-zA-Z0-9_][a-zA-Z0-9._-]{0,127})/
    )
  ) {
    res.sendStatus(400);
    return;
  }

  next();
}
