import { config } from '../../../../config.js';
import tasksList from '../../../../run/services/tasks.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Integration | Run | Services | Scheduled Tasks', function () {
  describe('#handler', function () {
    it('should call handler task function with the right parameters', async function () {
      // given
      const applicationName = config.tasks.autoScaleApplicationName;
      const region = config.tasks.autoScaleRegion;
      const autoScalingParameters = config.tasks.autoScaleUpSettings;

      const [morningAutoScaleTask] = tasksList.filter((task) => task.name === 'morningAutoScale');

      const taskAutoScaleWebStub = {
        run: sinon.stub(),
      };

      // when
      await morningAutoScaleTask.handler({ task: taskAutoScaleWebStub });

      // then
      expect(morningAutoScaleTask.enabled).to.equal(config.tasks.autoScaleEnabled);
      expect(morningAutoScaleTask.schedule).to.equal(config.tasks.scheduleAutoScaleUp);
      expect(taskAutoScaleWebStub.run.calledOnceWithExactly({ applicationName, region, autoScalingParameters })).to.be
        .true;
    });
  });
});
