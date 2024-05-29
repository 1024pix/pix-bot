import { config } from '../../config.js';
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
];

export default tasks;
