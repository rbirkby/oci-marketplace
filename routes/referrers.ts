import express, { type Response } from 'express';
import logger from '../logger';
import { digestValidator } from './validators';

export default (repository: Repository) => {
  const referrersRouter = express.Router({ mergeParams: true });

  // distribution spec v1.1.0-rc1
  referrersRouter.route('/:digest').get(digestValidator, (request: DigestArtifactRequest, res: Response) => {
    const { name, digest } = request.params;
    const { artifactType } = request.query;
    logger.debug('GET referrers by digest and artifactType %s %s %s', name, digest, artifactType);

    const imageIndex = {
      schemaVersion: 2,
      mediaType: 'application/vnd.oci.image.index.v1+json',
      manifests: repository
        .getReferrers(name, digest)
        .filter((manifest) => artifactType === undefined || manifest.artifactType === artifactType)
    };

    const headers: Record<string, string> = {
      // Test suite expects charset to be missing
      // post-1.1.0-rc3 spec includes phrase: 'The registry SHOULD NOT include parameters on the Content-Type header.
      // https://github.com/opencontainers/distribution-spec/commit/1af3bd8c47ab7a688e9a087f91f3da3da7b13828
      // This is insecure according to https://github.com/expressjs/express/issues/3490
      'content-type': 'application/vnd.oci.image.index.v1+json'
    };
    if (artifactType) headers['oci-filters-applied'] = 'artifactType';

    res.writeHead(200, headers).end(JSON.stringify(imageIndex));
  });

  return referrersRouter;
};
