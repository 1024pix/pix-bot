import { setTimeout } from 'node:timers/promises';

import * as reviewAppDeploymentRepository from '../repositories/review-app-deployment-repository.js';
import ScalingoClient from '../../common/services/scalingo-client.js';
import { logger } from '../../common/services/logger.js';
import { config } from '../../config.js';
import { knex } from '../../db/knex-database-connection.js';

let started = false;
let stopped;

export async function start() {
  let scalingoClient;

  try {
    scalingoClient = await ScalingoClient.getInstance('reviewApps');
  } catch (error) {
    throw new Error(`Scalingo auth APIError: ${error.message}`);
  }

  const delay = config.scalingo.reviewApps.deployDebounce / 5;

  started = true;
  stopped = Promise.withResolvers();

  const deployParams = {
    reviewAppDeploymentRepository,
    scalingoClient,
    get started() {
      return started;
    },
  };

  (async () => {
    while (started) {
      const [result] = await Promise.allSettled([
        deploy(deployParams),
        Promise.race([setTimeout(delay), stopped.promise]),
      ]);

      if (result.status === 'rejected') {
        logger.error({
          message: 'an error occured while deploying review apps',
          data: result.reason,
        });
      }
    }
  })();
}

export function stop() {
  started = false;
  stopped.resolve();
}

export async function deploy(params) {
  const { reviewAppDeploymentRepository, scalingoClient } = params;

  await knex.transaction(async (transaction) => {
    const deployments = await reviewAppDeploymentRepository.listForDeployment(transaction);

    for (const deployment of deployments) {
      if (!params.started) break;

      try {
        const reviewAppStillExists = await scalingoClient.reviewAppExists(deployment.appName);

        if (reviewAppStillExists) {
          await scalingoClient.deployUsingSCM(deployment.appName, deployment.scmRef);
        }

        await reviewAppDeploymentRepository.remove(deployment.appName, transaction);
      } catch (err) {
        logger.error({
          event: 'scalingo',
          message: 'error while trying to deploy review app',
          data: err,
        });
      }
    }
  });
}
