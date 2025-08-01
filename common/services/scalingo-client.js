import axios from 'axios';
import * as scalingo from 'scalingo';

import { config } from '../../config.js';
import { logger } from './logger.js';
import { ScalingoAppName } from '../models/ScalingoAppName.js';

const DEFAULT_OPTS = { withEnvSuffix: true };
const event = 'scalingo-client';

class ScalingoClient {
  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
  }

  static async getInstance(environment, injectedClient = scalingo) {
    const { token, apiUrl } = config.scalingo[environment];
    if (!token || !apiUrl) {
      logger.error({ event, message: `Scalingo credentials missing for environment`, data: { environment } });
      throw new Error(`Scalingo credentials missing for environment ${environment}`);
    }
    const client = await injectedClient.clientFromToken(token, { apiUrl });
    return new ScalingoClient(client, environment);
  }

  async deployFromArchive(pixApp, releaseTag, repository = config.github.repository, options = DEFAULT_OPTS) {
    if (!pixApp) {
      logger.error({ event, message: 'No application to deploy.' });
      throw new Error('No application to deploy.');
    }
    if (!releaseTag) {
      logger.error({ event, message: 'No release tag to deploy.' });
      throw new Error('No release tag to deploy.');
    }

    const scalingoApp = options.withEnvSuffix ? `${pixApp}-${this.environment}` : pixApp;

    try {
      await this.client.Deployments.create(scalingoApp, {
        git_ref: releaseTag,
        source_url: `https://${config.github.token}@github.com/${config.github.owner}/${repository}/archive/${releaseTag}.tar.gz`,
      });
    } catch (e) {
      logger.error({ event, message: e, data: { scalingoApp, releaseTag } });
      throw new Error(`Unable to deploy ${scalingoApp} ${releaseTag}`, { cause: e });
    }

    return `${scalingoApp} ${releaseTag} has been deployed`;
  }

  async deployUsingSCM(scalingoApp, ref) {
    try {
      const deployment = await this.client.SCMRepoLinks.manualDeploy(scalingoApp, ref);

      logger.info({ event, message: `Deployment has been requested`, data: { scalingoApp, ref } });

      return deployment.id;
    } catch (e) {
      logger.error({ event, message: e, data: { scalingoApp, ref } });
      throw new Error(`Unable to deploy ${scalingoApp} ${ref}`, { cause: e });
    }
  }

  async getAppInfo(target) {
    if (['production', 'integration', 'recette'].includes(target)) {
      return await this._getAllAppsInfo(target);
    }

    return [await this._getSingleAppInfo(target)];
  }

  async reviewAppExists(reviewAppName) {
    try {
      const { name } = await this.client.Apps.find(reviewAppName);
      return name == reviewAppName;
    } catch (err) {
      if (err.status === 404) {
        return false;
      }
      logger.error({
        event,
        message: `Error while checking if review app exists`,
        data: {
          err,
          reviewAppName,
        },
      });
      throw new Error(`Error while checking if review app exists`, { cause: err });
    }
  }

  async deployReviewApp(appName, prId) {
    try {
      await this.client.SCMRepoLinks.manualReviewApp(appName, prId);
    } catch (err) {
      logger.error({
        event,
        message: `error while creating review app`,
        data: {
          err,
          appName,
        },
      });
      throw new Error(`error while creating review app`, { cause: err });
    }
  }

  async disableAutoDeploy(appName) {
    const opts = { auto_deploy_enabled: false };
    try {
      await this.client.SCMRepoLinks.update(appName, opts);
    } catch (err) {
      logger.error({
        event,
        message: `error while disabling autodeploy on review app`,
        data: {
          err,
          appName,
        },
      });
      throw new Error(`error while disabling autodeploy on review app`, { cause: err });
    }
  }

  async _getAllAppsInfo(environment) {
    const apps = ['api', 'app', 'orga', 'certif', 'admin'];
    const promises = apps.map((appName) => this._getSingleAppInfo(appName, environment));
    return Promise.all(promises);
  }

  async _getSingleAppInfo(appName, environment = 'production') {
    let scalingoAppName = appName;
    if (!appName.match(/^pix-[a-z0-9-]*$/g)) {
      scalingoAppName = `pix-${appName}-${environment}`;
    }

    try {
      const { name, url, last_deployment_id } = await this.client.Apps.find(scalingoAppName);
      const { created_at, git_ref, pusher } = await this.client.Deployments.find(scalingoAppName, last_deployment_id);
      const isUp = await _isUrlReachable(url);

      return {
        name,
        url,
        isUp,
        lastDeployementAt: created_at,
        lastDeployedBy: pusher.username,
        lastDeployedVersion: git_ref,
      };
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Impossible to get info for ${scalingoAppName}`);
      }
      logger.error({ event, message: 'error while fetching app information', data: { err, appName, environment } });
      throw Error('error while fetching app information', { cause: err });
    }
  }
  async inviteCollaborator(applicationId, collaboratorEmail) {
    try {
      const { invitation_link } = await this.client.Collaborators.invite(applicationId, collaboratorEmail);
      return invitation_link;
    } catch (err) {
      logger.error({
        event,
        message: 'error while inviting collaboerator on app',
        data: { err, applicationId, collaboratorEmail },
      });
      throw new Error('error while inviting collaboerator on app', { cause: err });
    }
  }

  async createApplication(name) {
    const app = {
      name: name,
    };
    const appSettings = {
      force_https: true,
      router_logs: true,
    };
    try {
      const { id } = await this.client.Apps.create(app);
      await this.client.Apps.update(id, appSettings);
      logger.info({ event, message: `application created`, data: { name } });
      return id;
    } catch (err) {
      logger.error({ event, message: 'error while creating application', data: { err, name } });
      throw new Error(`error while creating application`, { cause: err });
    }
  }

  async updateAutoscaler(appname, updateParams) {
    let autoscalers;
    try {
      autoscalers = await this.client.Autoscalers.for(appname);
    } catch (err) {
      logger.error({ event, message: 'error while listing autoscalers for app', data: { err, appname } });
      throw new Error(`error while listing autoscalers for app`, { cause: err });
    }

    if (!Array.isArray(autoscalers) || !autoscalers.length) {
      throw new Error(`Aucun autoscaler trouvé pour l'application '${appname}'`);
    }

    const [webAutoscaler] = autoscalers.filter((autoscaler) => autoscaler.container_type == 'web');
    if (webAutoscaler) {
      try {
        await this.client.Autoscalers.update(appname, webAutoscaler.id, updateParams);
      } catch (err) {
        logger.error({ event, message: 'error while updating autoscaler for app', data: { err, appname } });
        throw new Error(`error while updating autoscaler for app`, { cause: err });
      }
    } else {
      throw new Error(`Aucun autoscaler web trouvé pour l'application '${appname}'`);
    }
  }

  async deleteReviewApp(appName) {
    if (!ScalingoAppName.isReviewApp(appName)) {
      throw new Error(`Cannot call deleteReviewApp for the non review app ${appName}.`);
    }

    try {
      await this.client.Apps.destroy(appName, appName);
    } catch (err) {
      logger.error({ event, message: 'error while deleting app', data: { err, appName } });
    }
  }

  async addDeploymentNotificationOnSlack(appName) {
    const slackNotifierId = await this.#getNotifierId('slack');
    const eventIds = await this.#getEventIds(['app_deployed']);

    try {
      const notifier = await this.client.Notifiers.create(appName, {
        platform_id: slackNotifierId,
        name: 'Deploy on #tech-releases',
        active: true,
        selected_event_ids: eventIds,
        type_data: {
          webhook_url: config.slack.techReleaseWebhookUrl,
        },
      });

      logger.info({
        event,
        message: `Notifier ${notifier.name} of type ${notifier.type} added for application ${notifier.app}.`,
      });

      return notifier;
    } catch (err) {
      logger.error({ event, message: 'error while creating slack notifier for app', data: { err, appName } });
      throw new Error(`error while creating slack notifier for app`, { cause: err });
    }
  }

  async addAlertNotificationsOnSlack(appName) {
    const slackNotifierId = await this.#getNotifierId('slack');
    const eventIds = await this.#getEventIds([
      'app_restarted',
      'app_crashed',
      'app_crashed_repeated',
      'app_stopped',
      'app_deleted',
      'addon_provisioned',
      'addon_resumed',
      'addon_suspended',
      'addon_plan_changed',
      'addon_db_upgraded',
      'addon_deleted',
      'domain_added',
      'domain_edited',
      'domain_removed',
      'notifier_added',
      'notifier_edited',
      'notifier_removed',
      'variable_added',
      'variable_edited',
      'variable_bulk_edited',
      'variable_removed',
      'addon_updated',
    ]);

    try {
      const notifier = await this.client.Notifiers.create(appName, {
        platform_id: slackNotifierId,
        name: 'Events logger on #alerte-pix-logs',
        active: true,
        selected_event_ids: eventIds,
        type_data: {
          webhook_url: config.slack.alertPixLogsWebhookUrl,
        },
      });

      logger.info({
        event,
        message: `Notifier ${notifier.name} of type ${notifier.type} added for application ${notifier.app}.`,
      });

      return notifier;
    } catch (err) {
      logger.error({ event, message: 'error while creating slack notifier for app', data: { err, appName } });
      throw new Error(`error while creating slack notifier for app`, { cause: err });
    }
  }

  async add5xxAlert(appName, notifierId) {
    try {
      const alert = await this.client.Alerts.create(appName, {
        container_type: 'web',
        metric: '5XX',
        limit: 1,
        duration_before_trigger: 0,
        notifiers: [notifierId],
      });

      logger.info({ event, message: `Alert on ${alert.metric} added for application ${appName}.` });

      return alert;
    } catch (err) {
      logger.error({ event, message: 'error while creating alert for app', data: { err, appName } });
      throw new Error(`error while creating alert for app`, { cause: err });
    }
  }

  async removeAddon(appName, providerId) {
    try {
      const addons = await this.client.Addons.for(appName);
      const addon = addons.find(({ addon_provider }) => addon_provider.id === providerId);
      if (!addon) return;
      await this.client.Addons.destroy(appName, addon.id);
    } catch (err) {
      logger.error({ event, message: 'error while removing addon for app', data: { err, appName } });
      throw new Error(`error while removing addon for app`, { cause: err });
    }
  }

  async #getNotifierId(notifierName) {
    let notifiers;
    try {
      notifiers = await this.client.NotificationPlatforms.list();
    } catch (err) {
      logger.error({ event, message: 'error while listing notifiers', data: { err } });
      throw new Error(`error while listing notifiers`, { cause: err });
    }

    const notifier = notifiers.find((notifier) => notifier.name === notifierName);
    if (!notifier) {
      throw new Error(`Notifier ${notifierName} not found.`);
    }

    return notifier.id;
  }

  async #getEventIds(eventNames) {
    let events;
    try {
      events = await this.client.Events.listEventTypes();
    } catch (err) {
      logger.error({ event, message: 'error while listing event types', data: { err } });
      throw new Error(`error while listing event types`, { cause: err });
    }

    return eventNames.map((eventName) => {
      const event = events.find((event) => event.name === eventName);
      if (!event) {
        throw new Error(`Event ${eventName} not found.`);
      }
      return event.id;
    });
  }
}

async function _isUrlReachable(url) {
  let pingUrl = url;
  if (url.includes('api')) {
    pingUrl = url + '/api';
  }

  try {
    await axios.get(pingUrl, {
      timeout: 2500,
    });
    return true;
  } catch (_) {
    return false;
  }
}

export default ScalingoClient;
