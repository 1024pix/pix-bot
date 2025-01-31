import { simpleGit } from 'simple-git';
import { mkdtemp } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { tmpdir } from 'node:os';

export class Git {
  constructor({ simpleGit }) {
    this.simpleGit = simpleGit;
  }

  async clone(repositoryUrl, gitOptions = {}) {
    const tempRepositoryPath = await mkdtemp(join(tmpdir(), sep));
    await this.simpleGit().clone(repositoryUrl, tempRepositoryPath, { '--depth': 1, ...gitOptions });
    return tempRepositoryPath;
  }

  async rebaseAndPush(repositoryPath, base, branch, head) {
    const git = await this.simpleGit();
    await git.cwd(repositoryPath);
    await git.fetch('origin');
    await git.pull('origin', branch, { '--rebase': 'true' });
    await git.rebase(base, branch);
    await git.push({ '--force-with-lease': null });
  }

  async enableAutoMerge(repositoryPath, base, branch) {

  }

}

export const git = new Git({ simpleGit });
