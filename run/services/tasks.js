import * as taskAutoScaleWeb from './tasks/autoscale-web';
import * as config from '../../config';

const tasks = [
  {
    name: 'morningAutoScale',
    enabled: config.autoScaleEnabled,
    schedule: config.scheduleAutoScaleUp,
    handler: async () => {
      await taskAutoScaleWeb.run({
        applicationName: config.autoScaleApplicationName,
        region: config.autoScaleRegion,
        autoScalingParameters: config.autoScaleUpSettings,
      });
    },
  },
  {
    name: 'eveningAutoScale',
    enabled: config.autoScaleEnabled,
    schedule: config.scheduleAutoScaleDown,
    handler: async () => {
      await taskAutoScaleWeb.run({
        applicationName: config.autoScaleApplicationName,
        region: config.autoScaleRegion,
        autoScalingParameters: config.autoScaleDownSettings,
      });
    },
  },
];

export { tasks };
