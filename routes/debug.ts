import express, { type Response, type Request } from 'express';
import logger from '../logger';

export default (repository: Repository) => {
  const debugRouter = express.Router();

  debugRouter.route('/health').get((request: Request, res: Response) => {
    logger.debug('Get Health');

    res.status(200).json({ ...repository.getDebugInfo(), status: 'healthy' });
  });

  debugRouter.route('/dashboard').get((request: Request, res: Response) => {
    logger.debug('Get Dashboard');

    const debugInfo = repository.getDebugInfo();

    const template = `
    <html>
    <head>
      <style>
        ul {list-style-type: none;padding:0}
        li {background-color: #ccc; margin:10px;white-space: pre; padding: 4px; border-radius: 4px;}
      </style>
    </head>
    <body>
      <h1>Dashboard</h1>
      <h2>Manifests</h2>
      <ul>
      ${JSON.parse(debugInfo?.manifests ?? '{}')
        ?.map((manifest: unknown) => `<li>${JSON.stringify(manifest, null, 2)}</li>`)
        .join('')}
      </ul>
      <h2>Tags</h2>
      <ul>
      ${JSON.parse(debugInfo?.tags ?? '{}')
        ?.map((tag: unknown) => `<li>${JSON.stringify(tag, null, 2)}</li>`)
        .join('')}
      </ul>
      <h2>Blobs</h2>
      <ul>
      ${JSON.parse(debugInfo?.blobs ?? '{}')
        ?.map((blob: unknown) => `<li>${JSON.stringify(blob, null, 2)}</li>`)
        .join('')}
      </ul>
    </body>
    </html>`;
    res.status(200).send(template);
  });

  return debugRouter;
};
