import ecoModeService from '../../../../build/services/eco-mode-service.js';
import { config } from '../../../../config.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Build | Services | Eco mode', function () {
  let ReviewAppManager;
  let startEcoMode;

  beforeEach(function () {
    startEcoMode = sinon.stub();
    ReviewAppManager = sinon.stub().returns({ startEcoMode });
    sinon.stub(config.ecoMode, 'stopSchedule').value('0 0 19 * * 1-5');
    sinon.stub(config.ecoMode, 'startSchedule').value('0 0 8 * * 1-5');
  });

  it('should start the eco mode on every Scalingo region hosting review apps', async function () {
    // when
    await ecoModeService.start({ ReviewAppManager });

    // then
    expect(ReviewAppManager).to.have.been.calledTwice;
    expect(ReviewAppManager.firstCall.args.slice(0, 2)).to.deep.equal([
      'tk-us-scalingo-token-reviewApps',
      'https://scalingo.reviewApps',
    ]);
    expect(ReviewAppManager.secondCall.args.slice(0, 2)).to.deep.equal([
      'tk-us-scalingo-token-reviewApps-secnum',
      'https://scalingo.reviewAppsSecnum',
    ]);
    expect(startEcoMode).to.have.been.calledTwice;
  });

  it('should skip the regions without token', async function () {
    // given
    sinon.stub(config.scalingo.reviewApps, 'osc-secnum-fr1').value({
      token: undefined,
      apiUrl: 'https://api.osc-secnum-fr1.scalingo.com',
    });

    // when
    await ecoModeService.start({ ReviewAppManager });

    // then
    expect(ReviewAppManager).to.have.been.calledOnceWith(
      'tk-us-scalingo-token-reviewApps',
      'https://scalingo.reviewApps',
    );
  });

  it('should not start the eco mode when no schedule is configured', async function () {
    // given
    sinon.stub(config.ecoMode, 'stopSchedule').value(undefined);

    // when
    await ecoModeService.start({ ReviewAppManager });

    // then
    expect(ReviewAppManager).to.not.have.been.called;
  });
});
