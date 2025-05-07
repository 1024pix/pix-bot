import { logger } from '../../../../../common/services/logger.js';
import * as taskRelease from '../../../../../run/services/tasks/release.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('#task-release', function () {
  it('should call release github workflow', async function () {
    // given
    const repository = '1024pix/pix-api-test';
    const branch = 'main';

    const githubClientStub = {
      triggerWorkflow: sinon.stub(),
    };
    const loggerInfoStub = sinon.stub(logger, 'info');

    // when
    await taskRelease.run({ repository, branch }, githubClientStub);

    // then
    expect(
      githubClientStub.triggerWorkflow.calledOnceWithExactly({
        workflow: {
          id: 'release.yml',
          repositoryName: repository,
          ref: branch,
        },
      }),
    ).to.be.true;
    expect(loggerInfoStub.calledTwice).to.be.true;
    expect(loggerInfoStub.firstCall.args[0]).to.deep.equal({
      event: 'release',
      message: `Starting ${repository} release.`,
    });
    expect(loggerInfoStub.secondCall.args[0]).to.deep.equal({
      event: 'release',
      message: `Release workflow triggered for repository ${repository}.`,
    });
  });

  it('should throw an error on github errors', async function () {
    // given
    const repository = '1024pix/pix-api-test';
    const branch = 'main';

    const githubClientStub = {
      triggerWorkflow: sinon.stub(),
    };
    githubClientStub.triggerWorkflow.rejects(new Error('Error during workflow run'));

    // when
    const error = await catchErr(taskRelease.run)({ repository, branch }, githubClientStub);

    // then
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.be.equal('Github APIError during release');
    expect(error.cause.message).to.be.equal('Error during workflow run');
  });
});
