import { Git } from '../../../../build/services/git.js';
import { expect, sinon } from '../../../test-helper.js';
import { describe } from 'mocha';

describe('Unit | Build | git-test', function () {
  describe('#clone', function () {
    it('should create tmp dir and clone repository on it', async function () {
      const cloneStub = sinon.stub()
      const simpleGit = () => {
        return {
          clone: cloneStub,
        };
      };

      const git = new Git({ simpleGit });

      const repoPath = await git.clone('http://github.com/1024pix/pix-sample');

      expect(repoPath.startsWith('/var/folders')).to.be.true;
      expect(cloneStub).to.have.been.calledOnceWithExactly('http://github.com/1024pix/pix-sample', repoPath, {
        '--depth': 1,
      });
    });
  });

  describe('#rebaseAndPush', function() {
    it('should switch to branch, rebase and push force with lease', async function() {
      const cwdStub = sinon.stub();
      const fetchStub = sinon.stub();
      const pullStub = sinon.stub();
      const rebaseStub = sinon.stub();
      const pushStub = sinon.stub();
      const simpleGit = () => {
        return {
          cwd: cwdStub,
          fetch: fetchStub,
          pull: pullStub,
          rebase: rebaseStub,
          push: pushStub,
        };
      };
      const repoPath = '/var/tjtk';
      const baseBranch = 'base-branch';
      const branch = 'branch';

      const git = new Git({ simpleGit });

      await git.rebaseAndPush(repoPath, baseBranch, branch);

      expect(cwdStub).to.have.been.calledOnceWithExactly(repoPath);
      expect(fetchStub).to.have.been.calledOnceWithExactly('origin');
      expect(pullStub).to.have.been.calledOnceWithExactly('origin', branch, { '--rebase': 'true' });
      expect(rebaseStub).to.have.been.calledOnceWithExactly(baseBranch, branch);
      expect(pushStub).to.have.been.calledOnceWithExactly({ '--force-with-lease': null });
    });
  });
});
