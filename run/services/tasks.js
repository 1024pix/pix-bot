import github from '../../common/services/github.js';
import { config } from '../../config.js';
import { deploy } from './deploy.js';
import * as taskAutoScaleWeb from './tasks/autoscale-web.js';

const tasks = [
  {
    name: 'morningAutoScale',
    enabled: config.tasks.autoScaleEnabled,
    schedule: config.tasks.scheduleAutoScaleUp,
    handler: async ({ task = taskAutoScaleWeb }) => {
      await task.run({
        applicationName: config.tasks.autoScaleApplicationName,
        region: config.tasks.autoScaleRegion,
        autoScalingParameters: config.tasks.autoScaleUpSettings,
      });
    },
  },
  {
    name: 'eveningAutoScale',
    enabled: config.tasks.autoScaleEnabled,
    schedule: config.tasks.scheduleAutoScaleDown,
    handler: async ({ task = taskAutoScaleWeb }) => {
      await task.run({
        applicationName: config.tasks.autoScaleApplicationName,
        region: config.tasks.autoScaleRegion,
        autoScalingParameters: config.tasks.autoScaleDownSettings,
      });
    },
  },
  {
    name: 'Deploy Pix site',
    enabled: true,
    schedule: config.pixSiteDeploy.schedule,
    handler: async () => {
      const repoName = config.PIX_SITE_REPO_NAME;
      const releaseTag = await github.getLatestReleaseTag(repoName);
      deploy(repoName, config.PIX_SITE_APPS, releaseTag);
    },
  },
];

export default tasks;
