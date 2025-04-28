import { config } from '../../../../config.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Integration | Run | Services | Scheduled Tasks', function () {
  let morningAutoScaleTask, eveningAutoScaleTask, monorepoReleaseTask;

  beforeEach(async function () {
    sinon.stub(config.tasks, 'autoScaleEnabled').value(true);
    sinon.stub(config.tasks, 'autoScaleApplicationName').value('applicationName');
    sinon.stub(config.tasks, 'autoScaleRegion').value('region');

    sinon.stub(config.tasks, 'scheduleAutoScaleUp').value('* * * * * *');
    sinon.stub(config.tasks, 'autoScaleUpSettings').value({ min: 0, max: 10 });

    sinon.stub(config.tasks, 'scheduleAutoScaleDown').value('* * * * * *');
    sinon.stub(config.tasks, 'autoScaleDownSettings').value({ min: 0, max: 10 });

    sinon.stub(config.tasks, 'monorepoReleaseEnabled').value(true);
    sinon.stub(config.tasks, 'monorepoReleaseSchedule').value('* * * * * *');
    sinon.stub(config.tasks, 'monorepoReleaseRepository').value('repository');
    sinon.stub(config.tasks, 'monorepoReleaseBranch').value('branch');

    const { tasks } = await import('../../../../run/services/tasks.js');
    morningAutoScaleTask = tasks.filter((task) => task.name === 'morningAutoScale')[0];
    eveningAutoScaleTask = tasks.filter((task) => task.name === 'eveningAutoScale')[0];
    monorepoReleaseTask = tasks.filter((task) => task.name === 'monorepoRelease')[0];
  });

  describe('morningAutoScale', function () {
    it('should call handler task function with the right parameters', async function () {
      // given
      morningAutoScaleTask.job = {
        run: sinon.stub(),
      };

      // when
      await morningAutoScaleTask.handler();

      // then
      expect(morningAutoScaleTask.enabled).to.equal(true);
      expect(morningAutoScaleTask.schedule).to.equal('* * * * * *');
      expect(
        morningAutoScaleTask.job.run.calledOnceWithExactly({
          applicationName: 'applicationName',
          region: 'region',
          autoScalingParameters: { min: 0, max: 10 },
        }),
      ).to.be.true;
    });
  });

  describe('eveningAutoScale', function () {
    it('should call handler task function with the right parameters', async function () {
      // given
      eveningAutoScaleTask.job = {
        run: sinon.stub(),
      };

      // when
      await eveningAutoScaleTask.handler();

      // then
      expect(eveningAutoScaleTask.enabled).to.equal(true);
      expect(eveningAutoScaleTask.schedule).to.equal('* * * * * *');
      expect(
        eveningAutoScaleTask.job.run.calledOnceWithExactly({
          applicationName: 'applicationName',
          region: 'region',
          autoScalingParameters: { min: 0, max: 10 },
        }),
      ).to.be.true;
    });
  });

  describe('monorepoRelease', function () {
    it('should call handler task function with the right parameters', async function () {
      // given
      monorepoReleaseTask.job = {
        run: sinon.stub(),
      };

      // when
      await monorepoReleaseTask.handler();

      // then
      expect(monorepoReleaseTask.enabled).to.equal(true);
      expect(monorepoReleaseTask.schedule).to.equal('* * * * * *');
      expect(monorepoReleaseTask.job.run.calledOnceWithExactly({ repository: 'repository', branch: 'branch' })).to.be
        .true;
    });
  });
});
