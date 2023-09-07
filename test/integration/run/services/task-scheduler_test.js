const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');
const taskScheluder = require('../../../../run/services/task-scheduler');

describe('Integration | Run | Services | schedule-task', function () {
  let clock;
  const ONE_SECOND = 1 * 10 ** 3;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
    sinon.restore();
  });

  describe('#ScheduleTask', function () {
    it('should schedule enabled tasks', function () {
      // given
      const loggerInfoStub = sinon.stub(logger, 'info');

      const runStub = sinon.stub();
      const testTasks = [
        {
          name: 'task1',
          enabled: true,
          schedule: '* * * * * *',
          handler: runStub,
        },
      ];

      // when
      taskScheluder(testTasks);

      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(ONE_SECOND - 1);

      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(1);

      // then
      expect(runStub).to.have.been.calledOnce;

      expect(loggerInfoStub.calledOnce).to.be.true;
      expect(loggerInfoStub.firstCall.args[0]).to.deep.equal({
        event: 'task-scheduler',
        message: 'task task1 scheduled * * * * * *',
      });
    });

    it('should not schedule tasks', function () {
      // given
      const loggerInfoStub = sinon.stub(logger, 'info');

      const runStub = sinon.stub();
      const testTasks = [
        {
          name: 'task1',
          enabled: false,
          schedule: '* * * * * *',
          handler: runStub,
        },
      ];

      // when
      taskScheluder(testTasks);
      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(ONE_SECOND - 1);

      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(1);

      // then
      expect(runStub).to.not.have.been.called;

      expect(loggerInfoStub.calledOnce).to.be.true;

      expect(loggerInfoStub.firstCall.args[0]).to.deep.equal({
        event: 'task-scheduler',
        message: 'task task1 not scheduled',
      });
    });
  });
});
