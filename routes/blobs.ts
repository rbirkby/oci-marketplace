import express, { type Response } from 'express';
import { Buffer } from 'node:buffer';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import { OciRangeError } from '../repositories/memoryRepository';
import errorResponse from './errorfactory';

const parseRange = (range: OciRange): number[] =>
  range
    .match(/^([0-9]+)-([0-9]+)$/)
    ?.slice(1, 3)
    ?.map((position) => parseInt(position)) ?? [];

export default (repository: Repository) => {
  const blobsRouter = express.Router({ mergeParams: true });
  blobsRouter.use(bodyParser.raw({ type: 'application/octet-stream' }));

  blobsRouter.route('/:digest').get(async (request: DigestRequest, res: Response) => {
    const { name, digest } = request.params;
    logger.debug('GET blob by digest %s %s', name, digest);

    try {
      const blob = repository.getBlob(name, digest);
      res.status(200).send(blob);
    } catch (e) {
      logger.debug(e);
      res.status(404).json(errorResponse('BLOB_UNKNOWN'));
    }
  });

  blobsRouter.route('/uploads/').post(async (request: DigestSearchRequest, res: Response) => {
    const { name } = request.params;
    const { digest } = request.query;

    const type = request.header('content-type');
    const length = request.header('content-length');

    logger.debug('POST blob, optionally by digest %s %s %s %s', name, digest, type, length);

    const sessionId = uuidv4();
    repository.addBlob(name, sessionId, Buffer.alloc(0));
    res.location(`${request.baseUrl}/uploads/${sessionId}`).sendStatus(202);
  });

  blobsRouter.route('/uploads/:reference').patch(async (request: ReferenceRequest, res: Response) => {
    const { name, reference } = request.params;

    const type = request.header('content-type');
    const range = request.header('content-range') as OciRange; // Optional per test suite. Mandatory per spec.
    const length = request.header('content-length');

    logger.debug('PATCH blob by reference %s %s %s %s %s', name, reference, type, range, length);

    const [start, end] = range ? parseRange(range) : [0, parseInt(length ?? '0')];

    try {
      repository.updateBlob(name, reference, start ?? 0, end ?? 0, request.body);

      res
        .header('Range', `0-${end}`) // distribution spec v1.1.0-rc2
        .location(`${request.baseUrl}/uploads/${reference}`)
        .sendStatus(202);
    } catch (e) {
      if (e instanceof OciRangeError) {
        logger.debug(e);
        res.status(416).json(errorResponse('BLOB_UPLOAD_INVALID', 'Requested Range Not Satisfiable'));
      } else {
        logger.debug(e);
        res.status(404).json(errorResponse('BLOB_UPLOAD_UNKNOWN'));
      }
    }
  });

  blobsRouter.route('/uploads/:reference/').put(async (request: ReferenceDigestSearchRequest, res: Response) => {
    const { name, reference } = request.params;
    const { digest } = request.query;
    logger.debug('PUT blob by reference and digest %s %s %s', name, reference, digest);

    const range = request.header('content-range') as OciRange;

    try {
      if (range) {
        const [start, end] = parseRange(range);

        repository.updateBlob(name, reference, start ?? 0, end ?? 0, request.body);
        repository.setBlobDigest(name, reference, digest);
      } else {
        repository.addBlob(name, reference, request.body);
        repository.setBlobDigest(name, reference, digest);
      }
      res.location(`${request.baseUrl}/${request.query.digest}`).sendStatus(201);
    } catch (e) {
      if (e instanceof OciRangeError) {
        logger.debug(e);
        res.status(416).json(errorResponse('BLOB_UPLOAD_INVALID', 'Requested Range Not Satisfiable'));
      } else {
        logger.debug(e);
        res.status(404).json(errorResponse('BLOB_UPLOAD_UNKNOWN'));
      }
    }
  });

  blobsRouter.route('/:digest').delete(async (request: DigestRequest, res: Response) => {
    const { name, digest } = request.params;
    logger.debug('DELETE blob by digest %s %s', name, digest);

    repository.deleteBlob(name, digest);

    res.sendStatus(202);
  });

  blobsRouter.route('/uploads/').post(async (request: MountRequest, res: Response) => {
    const { name } = request.params;
    const { mount: digest, from: otherName } = request.query;
    logger.debug('POST blob from another repository %s %s %s', name, digest, otherName);

    // Implementation does not support cross-repository mounting
    res.sendStatus(202);
  });

  // distribution spec v1.1.0-rc2
  blobsRouter.route('/uploads/:reference').get(async (request: ReferenceRequest, res: Response) => {
    const { name, reference } = request.params;
    logger.debug('GET blob by reference %s %s', name, reference);

    try {
      const end = repository.getBlobLength(name, reference);
      res.header('Range', `0-${end}`).location(`${request.baseUrl}/uploads/${reference}`).sendStatus(204);
    } catch (e) {
      logger.debug(e);
      res.status(404).json(errorResponse('BLOB_UNKNOWN'));
    }
  });

  return blobsRouter;
};
