import ScalingoClient from '../../common/services/scalingo-client.js';
import { logger } from '../../common/services/logger.js';
import { knex } from '../../db/knex-database-connection.js';
import * as reviewAppRepository from '../repositories/review-app-repository.js';
import { config } from '../../config.js';

export async function deployReviewApps(dependencies = { ScalingoClient, reviewAppRepository, getRetryAfter, knex }) {
  let deployed;

  const scalingoClient = await dependencies.ScalingoClient.getInstance('reviewApps');

  logger.info({ event: 'deploy-review-apps', message: 'starting review apps deployment' });

  do {
    deployed = await dependencies.knex.transaction(async (transaction) => {
      const application = await dependencies.reviewAppRepository.getForDeployment(transaction);

      if (!application) return false;

      try {
        await scalingoClient.deployUsingSCM(application.name, application.deployScmRef);

        await dependencies.reviewAppRepository.markAsDeploying(application, transaction);
      } catch (err) {
        logger.error({
          event: 'deploy-review-apps',
          message: 'error while trying to deploy review app',
          appName: application.name,
          err,
        });

        await dependencies.reviewAppRepository.scheduleDeployment({
          name: application.name,
          deployScmRef: application.deployScmRef,
          deployAfter: dependencies.getRetryAfter(),
        });
      }

      return true;
    });
  } while (deployed);
}

function getRetryAfter() {
  return new Date(Date.now() + config.scalingo.reviewApps.deployRetryAfter);
}
