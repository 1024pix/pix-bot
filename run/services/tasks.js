import { config } from '../../config.js';
import * as taskAutoScaleWeb from './tasks/autoscale-web.js';
import * as taskRelease from './tasks/release.js';

class Task {
  constructor({ name, enabled, schedule, job, params }) {
    this.name = name;
    this.enabled = enabled;
    this.schedule = schedule;
    this.job = job;
    this.params = params;
    this.context = this;
  }

  async handler() {
    return this.job.run(this.params);
  }
}

const tasks = [
  new Task({
    name: 'morningAutoScale',
    enabled: config.tasks.autoScaleEnabled,
    schedule: config.tasks.scheduleAutoScaleUp,
    job: taskAutoScaleWeb,
    params: {
      applicationName: config.tasks.autoScaleApplicationName,
      region: config.tasks.autoScaleRegion,
      autoScalingParameters: config.tasks.autoScaleUpSettings,
    },
  }),
  new Task({
    name: 'eveningAutoScale',
    enabled: config.tasks.autoScaleEnabled,
    schedule: config.tasks.scheduleAutoScaleDown,
    job: taskAutoScaleWeb,
    params: {
      applicationName: config.tasks.autoScaleApplicationName,
      region: config.tasks.autoScaleRegion,
      autoScalingParameters: config.tasks.autoScaleDownSettings,
    },
  }),
  new Task({
    name: 'monorepoRelease',
    enabled: config.tasks.monorepoReleaseEnabled,
    schedule: config.tasks.monorepoReleaseSchedule,
    job: taskRelease,
    params: {
      repository: config.tasks.monorepoReleaseRepository,
      branch: config.tasks.monorepoReleaseBranch,
    },
  }),
];

export { tasks };
