import ecoModeService from '../../../../build/services/eco-mode-service.js';
import { config } from '../../../../config.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Build | Services | Eco mode', function () {
  let ReviewAppManager;
  let managers;

  beforeEach(function () {
    managers = [];
    ReviewAppManager = sinon.stub().callsFake(function () {
      const manager = { startEcoMode: sinon.stub() };
      managers.push(manager);
      return manager;
    });
    sinon.stub(config.ecoMode, 'startSchedule').value('0 0 8 * * 1-5');
  });

  it('should start the eco mode on the review apps of every Scalingo region', async function () {
    // given
    sinon.stub(config.ecoMode, 'stopSchedule').value('0 0 19 * * 1-5');

    // when
    await ecoModeService.start({ ReviewAppManager });

    // then
    expect(managers).to.have.lengthOf(2);
    expect(ReviewAppManager.firstCall).to.have.been.calledWithExactly(
      config.scalingo.reviewApps.token,
      config.scalingo.reviewApps.apiUrl,
      sinon.match.object,
    );
    expect(ReviewAppManager.secondCall).to.have.been.calledWithExactly(
      config.scalingo.reviewAppsSecNum.token,
      config.scalingo.reviewAppsSecNum.apiUrl,
      sinon.match.object,
    );
    expect(ReviewAppManager.firstCall.args[2]).to.deep.equal(ReviewAppManager.secondCall.args[2]);
    expect(managers[0].startEcoMode).to.have.been.calledOnce;
    expect(managers[1].startEcoMode).to.have.been.calledOnce;
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
