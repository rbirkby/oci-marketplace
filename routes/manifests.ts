import express, { type Response } from 'express';
import { type Buffer } from 'node:buffer';
import bodyParser from 'body-parser';
import logger from '../logger';
import errorResponse from './errorfactory';

declare module 'http' {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

export default (repository: Repository) => {
  const manifestsRouter = express.Router({ mergeParams: true });
  manifestsRouter.use(
    bodyParser.json({
      // application/vnd.oci.image.index.v1+json
      // application/vnd.oci.image.manifest.v1+json
      type: '*/*',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    })
  );

  manifestsRouter.route('/:reference').get(async (request: ReferenceRequest, res: Response) => {
    const { name, reference } = request.params;
    logger.debug('GET manifest by reference %s %s', name, reference);

    try {
      const manifest = repository.getManifest(name, reference);

      res.status(200).json(manifest);
    } catch (e) {
      logger.debug(e);
      res.status(404).json(errorResponse('MANIFEST_UNKNOWN'));
    }
  });

  manifestsRouter.route('/:reference').put(async (request: ReferenceRequest, res: Response) => {
    const { name, reference } = request.params;
    logger.debug('PUT manifest by reference %s %s', name, reference);

    // Distribution spec v1.0.0 limits content-type to application/vnd.oci.image.manifest.v1+json
    // v1.0.1 relaxes this to allow any JSON content-type
    repository.setManifest(name, reference, request.rawBody);

    if (request.body.subject) {
      // OCI-Subject header added in distribution spec v1.1.0-rc2
      res
        .status(201)
        .header('OCI-Subject', request.body.subject.digest)
        .location(`${request.baseUrl}/${reference}`)
        .end();
    } else {
      res.status(201).location(`${request.baseUrl}/${reference}`).end();
    }
  });

  // Deletes either a manifest or a tag
  manifestsRouter.route('/:reference').delete(async (request: ReferenceRequest, res: Response) => {
    const { name, reference } = request.params;
    logger.debug('DELETE tags or manifest by digest %s %s', name, reference);

    repository.deleteManifestOrTag(name, reference);

    res.status(202).end();
  });

  return manifestsRouter;
};
