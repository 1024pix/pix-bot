import { catchErr, expect, sinon } from '../../../test-helper.js';
import mergeController from '../../../../build/controllers/merge.js';
import { config } from '../../../../config.js';
import { MERGE_STATUS } from '../../../../build/services/merge-queue.js';

describe('Unit | Controller | Merge', function () {
  describe('#handle', function () {
    it('should throw when token is invalid', async function () {
      const request = {
        headers: {
          authorization: 'Invalid token',
        },
      };

      // when
      const error = await catchErr(mergeController.handle)(request);

      // then
      expect(error.message).to.equal('Token is missing or is incorrect');
    });

    it('should remove the merge from the database', async function () {
      const request = {
        headers: {
          authorization: `Bearer ${config.authorizationToken}`,
        },
        payload: { pullRequest: '1024pix/pix/123' },
      };

      const mergeQueue = { unmanagePullRequest: sinon.stub() };
      const hStub = {
        response: sinon.stub(),
      };
      hStub.response.returns({ code: () => {} });

      // when
      await mergeController.handle(request, hStub, { mergeQueue });

      // then
      expect(mergeQueue.unmanagePullRequest).to.be.calledOnceWithExactly({
        number: 123,
        repositoryName: '1024pix/pix',
        status: MERGE_STATUS.ERROR,
      });

      expect(hStub.response).to.be.calledOnce;
    });
  });
});
