import { expect, sinon } from '../../../test-helper';

import * as taskAutoScaleWeb from '../../../../run/services/tasks/autoscale-web';
import config from '../../../../config';
import tasksList from '../../../../run/services/tasks.js';

describe('Integration | Run | Services | Scheduled Tasks', function () {
  describe('#handler', function () {
    afterEach(function () {
      sinon.restore();
    });

    it('should call handler task function with the right parameters', async function () {
      // given
      const applicationName = 'pix-api-recette';
      const region = 'recette';
      const autoScalingParameters = { min: 2, max: 4 };
      const schedule = '* * * * * *';

      sinon.stub(config, 'autoScaleApplicationName').value(applicationName);
      sinon.stub(config, 'autoScaleRegion').value(region);
      sinon.stub(config, 'autoScaleUpSettings').value(autoScalingParameters);
      sinon.stub(config, 'autoScaleEnabled').value(true);
      sinon.stub(config, 'scheduleAutoScaleUp').value(schedule);

      const [morningAutoScaleTask] = tasksList.filter((task) => task.name === 'morningAutoScale');

      const runStub = sinon.stub();
      const taskAutoScaleWebStub = sinon.stub(taskAutoScaleWeb);
      taskAutoScaleWebStub.run = runStub;

      // when
      await morningAutoScaleTask.handler();

      // then
      expect(morningAutoScaleTask.enabled).to.be.true;
      expect(morningAutoScaleTask.schedule).to.equal(schedule);
      expect(runStub.calledOnceWithExactly({ applicationName, region, autoScalingParameters })).to.be.true;
    });
  });
});
