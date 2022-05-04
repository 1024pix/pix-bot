const { expect } = require('chai');

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const simpleGit = require('simple-git');
const dayjs = require('dayjs');

const { runScriptWithArgument, expectLines } = require('./script-helpers');

const scriptName = 'publish.sh';

// You are entering a world of pain
// To update this test you need to update the github repository https://github.com/1024pix/pix-bot-publish-test
// and the cloned one on data/clean_repository.git
// rm -rf data/clean_repository.git
// git clone --bare https://github.com/1024pix/pix-bot-publish-test data/clean_repository.git
// Make sure that empty folders on the bare git repostory have a .gitkeep file
// Have a nice day
describe('Acceptance | Scripts | publish.sh', function() {
  this.timeout(30000);
  let testRepositoryPath;

  beforeEach(async () => {
    const originRepositoryPath = path.join(__dirname, 'data', 'clean_repository.git');
    testRepositoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'clean-repository'));

    await fs.copy(originRepositoryPath, testRepositoryPath);
  });

  afterEach(async () => {
    await fs.rm(testRepositoryPath, { force: true, recursive: true });
  });

  it('Update package version, generate changelog, commit, tag and push', async () => {
    // given
    const branchName = 'dev';
    const versionType = 'minor';
    const gitUser = 'Git';
    const gitEmail = 'git@example.net';
    const githubOwner = '1024pix';
    const githubRepository = 'pix-bot-publish-test';
    const env = {
      ...process.env,
      GIT_USER_NAME: gitUser,
      GIT_USER_EMAIL: gitEmail,
      GITHUB_OWNER: githubOwner,
      GITHUB_REPOSITORY: githubRepository,
    };

    // when
    const { stdout, stderr } = await runScriptWithArgument(scriptName, [versionType, testRepositoryPath, branchName], { env });

    // then
    const expectedStdout = [
      /\//,
      'Preparing a new release.',
      '',
      '== Clone and move into Pix repository ==',
      /^Created temporary directory/,
      'Cloned repository 1024pix/pix-bot-publish-test to temporary directory',
      'Moved to repository folder',
      '== Validate context ==',
      'Git changes status OK',
      'Version type OK',
      '== Package release ==',
      'Bumped versions in package files',
      'Writing to CHANGELOG.md',
      'Updated CHANGELOG.md',
      'Set Git user information',
      /A minor is being released to 0.2.0.$/,
      ' 9 files changed, 14 insertions(+), 8 deletions(-)',
      'Created the release commit',
      'Created annotated tag',
      'Pushed release commit to the origin',
      'Ignoring sentry in tests.',
      'Release publication \u001b[1;32msucceeded\u001b[0m.',
      'v0.2.0',
      '',
    ];
    const expectedStderr = [
      /^Cloning into/,
      'warning: --depth is ignored in local clones; use file:// instead.',
      'done.',
      /To (.+)/,
      /dev -> dev/,
      /v0.2.0 -> v0.2.0/,
      ''
    ];
    expectLines(expectedStdout, stdout);
    expectLines(expectedStderr, stderr);
    const git = simpleGit(testRepositoryPath);
    const tags = await git.tag();
    expect(tags).to.eql('v0.1.0\nv0.1.1\nv0.2.0\n');
    const changelog = await git.show('dev:CHANGELOG.md');
    const now = dayjs().format('DD/MM/YYYY');
    expect(changelog).to.eql(`
## v0.2.0 (${now})


### :rocket: Amélioration
- [#1](https://github.com/1024pix/pix-bot-publish-test/pull/1) [FEATURE] Ajout d'un index pour Pix App
`);
  });
});
