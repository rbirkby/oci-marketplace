import express, { type Response } from 'express';
import logger from '../logger';

export default (repository: Repository) => {
  const tagsRouter = express.Router({ mergeParams: true });

  tagsRouter.route('/list').get((request: PaginatedPlainRequest, res: Response) => {
    const { name } = request.params;
    const { n, last } = request.query;
    logger.debug('GET Tags from last %s %s %s', name, String(n), String(last));

    let tags = repository.getTags(name).toSorted();
    if (last && n) {
      tags = tags.slice(tags.indexOf(last), n);
    } else if (last) {
      tags = tags.slice(tags.indexOf(last));
    } else if (n) {
      tags = tags.slice(0, n);
    }

    res.status(200).json({ name, tags });
  });

  return tagsRouter;
};
