import * as taskAutoscaleWeb from '../../../../../run/services/tasks/autoscale-web';
import * as logger from '../../../../../common/services/logger';
import { expect, sinon, catchErr } from '../../../../test-helper';

describe('#task-autoscale-web', function () {
  it('should call autoscale on web container for specified application', async function () {
    // given
    const applicationName = 'pix-api-test';
    const region = 'recette';
    const autoScalingParameters = { min: 2, max: 4 };

    const scalingoClientStub = sinon.stub();
    const updateAutoscalerStub = sinon.stub();

    const loggerInfoStub = sinon.stub(logger, 'info');

    const getInstanceStub = sinon.stub().resolves({
      updateAutoscaler: updateAutoscalerStub,
    });
    scalingoClientStub.getInstance = getInstanceStub;

    // when
    await taskAutoscaleWeb.run({ applicationName, region, autoScalingParameters }, scalingoClientStub);

    // then
    expect(getInstanceStub.calledOnceWithExactly(region)).to.be.true;
    expect(updateAutoscalerStub.calledOnceWithExactly(applicationName, autoScalingParameters)).to.be.true;
    expect(loggerInfoStub.calledTwice).to.be.true;
    expect(loggerInfoStub.firstCall.args[0]).to.deep.equal({
      event: 'scalingo-autoscaler',
      message: 'Starting autoscaling for pix-api-test with min: 2 and max: 4',
    });
    expect(loggerInfoStub.secondCall.args[0]).to.deep.equal({
      event: 'scalingo-autoscaler',
      message: 'pix-api-test has been austocaled with sucess to min: 2 and max: 4',
    });
  });

  it('should throw an error on scalingo errors', async function () {
    // given
    const applicationName = 'pix-api-test';
    const region = 'recette';
    const autoScalingParameters = { min: 2, max: 4 };

    const scalingoClientStub = sinon.stub();
    const updateAutoscalerStub = sinon.stub().rejects(new Error('Cannot configure autoscaler'));

    const getInstanceStub = sinon.stub().resolves({
      updateAutoscaler: updateAutoscalerStub,
    });

    scalingoClientStub.getInstance = getInstanceStub;

    // when
    const result = await catchErr(taskAutoscaleWeb.run)(
      { applicationName, region, autoScalingParameters },
      scalingoClientStub,
    );

    // then
    expect(getInstanceStub.calledOnceWithExactly(region)).to.be.true;
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.be.equal('Scalingo APIError: Cannot configure autoscaler');
  });
});
