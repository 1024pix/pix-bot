const {
  expect,
  nock,
  createGithubWebhookSignatureHeader,
  catchErr,
  sinon,
  StatusCodes,
} = require('../../../test-helper');
const githubService = require('../../../../common/services/github');
const logger = require('../../../../common/services/logger');

describe('#getPullRequests', function () {
  it('should return the response for slack', async function () {
    // given
    const items = [
      { html_url: 'http://test1.fr', number: 0, title: 'PR1', labels: [{ name: 'team certif' }] },
      {
        html_url: 'http://test2.fr',
        number: 1,
        title: 'PR2',
        labels: [{ name: ':construction: toto' }, { name: ':idea: team certif' }],
      },
    ];

    nock('https://api.github.com')
      .get(
        '/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+draft%3Afalse+user%3Agithub-owner+label%3Ateam-certif&sort=updated&order=desc',
      )
      .reply(200, { items });

    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/0/reviews')
      .reply(200, [{ state: 'COMMENTED' }, { state: 'APPROVED' }]);
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/1/reviews')
      .reply(200, [{ state: 'CHANGES_REQUESTED' }]);

    const expectedResponse = {
      response_type: 'in_channel',
      text: 'PRs à review pour team-certif',
      attachments: [
        { color: '#B7CEF5', pretext: '', fields: [{ value: '💬x1 ✅x1 | <http://test1.fr|PR1>', short: false }] },
        {
          color: '#B7CEF5',
          pretext: '',
          fields: [{ value: '❌x1 | :construction: :idea: | <http://test2.fr|PR2>', short: false }],
        },
      ],
    };

    // when
    const response = await githubService.getPullRequests('team-certif');

    // then
    expect(response).to.deep.equal(expectedResponse);
  });

  it('should call the Github API with the label', async function () {
    // given
    let scopePr, scopeReview;
    const items = [{ html_url: 'http://test1.fr', number: 0, title: 'PR1', labels: [{ name: 'cross-team' }] }];
    scopePr = nock('https://api.github.com')
      .get(
        '/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+draft%3Afalse+user%3Agithub-owner+label%3Across-team&sort=updated&order=desc',
      )
      .reply(200, { items });

    scopeReview = nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/0/reviews')
      .reply(200, []);

    // when
    await githubService.getPullRequests('cross-team');

    // then
    expect(scopePr.isDone());
    expect(scopeReview.isDone());
  });

  describe('when Github API rate-limit is exceeded', function () {
    it('should call logger with a properly formatted error-message', async function () {
      // given
      const loggerErrorStub = sinon.stub(logger, 'error');
      nock('https://api.github.com')
        .get(
          '/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+draft%3Afalse+user%3Agithub-owner+label%3Across-team&sort=updated&order=desc',
        )
        .reply(StatusCodes.FORBIDDEN, 'API rate limit exceeded for user ID 1. [rate reset in 8m48s]');

      // when
      await catchErr(githubService.getPullRequests)('cross-team');

      // then
      expect(loggerErrorStub.calledOnce).to.be.true;
      expect(loggerErrorStub.firstCall.args[0]).to.deep.equal({
        event: 'github',
        message: 'API rate limit exceeded for user ID 1. [rate reset in 8m48s]',
      });
    });
    it('should throw an error', async function () {
      // given
      sinon.stub(logger, 'error');
      nock('https://api.github.com')
        .get(
          '/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+draft%3Afalse+user%3Agithub-owner+label%3Across-team&sort=updated&order=desc',
        )
        .reply(StatusCodes.FORBIDDEN, 'API rate limit exceeded for user ID 1. [rate reset in 8m48s]');

      // when
      const error = await catchErr(githubService.getPullRequests)('cross-team');

      // then
      expect(error.message).to.deep.equal('Cannot retrieve PR from Github');
    });
  });
});

describe('#getLatestReleaseTag', function () {
  it('should call GitHub "Tags" API', async function () {
    // given
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/tags')
      .reply(200, [{ name: 'v2.171.0' }, { name: 'v2.170.0' }]);

    // when
    const response = await githubService.getLatestReleaseTag();

    // then
    expect(response).to.equal('v2.171.0');
  });

  it('should call GitHub "Tags" API for the given repository', async function () {
    // given
    nock('https://api.github.com')
      .get('/repos/github-owner/given-repository/tags')
      .reply(200, [{ name: 'v2.171.0' }, { name: 'v2.170.0' }]);

    // when
    const response = await githubService.getLatestReleaseTag('given-repository');

    // then
    expect(response).to.equal('v2.171.0');
  });
});

describe('#getChangelogSinceLatestRelease', function () {
  it('should return the list of PR titles since latest release', async function () {
    // given
    const latestTagDate = new Date('2020-04-01T15:29:51Z');
    const afterTag1Date = new Date('2020-06-01T15:29:51Z');
    const afterTag2Date = new Date('2020-05-01T15:29:51Z');
    const beforeTagDate = new Date('2020-02-01T15:29:51Z');
    const repoOwner = 'repo-owner';
    const repoName = 'repo-name';
    nock('https://api.github.com')
      .get(`/repos/${repoOwner}/${repoName}/tags`)
      .reply(200, [
        { commit: { url: '/latest_tag_commit_url' } },
        { commit: { url: '/some_tag_commit_url' } },
        { commit: { url: '/some_other_tag_commit_url' } },
      ]);
    nock('https://api.github.com')
      .get('/latest_tag_commit_url')
      .reply(200, { commit: { committer: { date: latestTagDate } } });
    nock('https://api.github.com')
      .get(`/repos/${repoOwner}/${repoName}`)
      .reply(200, { default_branch: 'my_default_branch' });
    nock('https://api.github.com')
      .get(`/repos/${repoOwner}/${repoName}/pulls`)
      .query({
        base: 'my_default_branch',
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      })
      .reply(200, [
        { merged_at: afterTag1Date, title: 'PR Protéines' },
        { merged_at: afterTag2Date, title: 'PR Légumes' },
        { merged_at: beforeTagDate, title: 'PR Fruit' },
      ]);

    // when
    const response = await githubService.getChangelogSinceLatestRelease(repoOwner, repoName);

    // then
    expect(response).to.deep.equal(['PR Protéines', 'PR Légumes']);
  });
});

describe('#getMergedPullRequestsSortedByDescendingDate', function () {
  it('should call GitHub "Pulls" API', async function () {
    // given
    const pullRequests = [{ merged_at: '2020-09-02T12:26:47Z' }, { merged_at: '2020-09-01T12:26:47Z' }];
    nock('https://api.github.com').get('/repos/github-owner/github-repository').reply(200, { default_branch: 'dev' });
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls?state=closed&sort=updated&direction=desc&base=dev&per_page=100')
      .reply(200, pullRequests);

    // when
    const response = await githubService.getMergedPullRequestsSortedByDescendingDate(
      'github-owner',
      'github-repository',
    );

    // then
    expect(response).to.deep.equal(pullRequests);
  });

  it('should call GitHub "Pulls" API with given branch name', async function () {
    // given
    const pullRequests = [{ merged_at: '2020-09-02T12:26:47Z' }, { merged_at: '2020-09-01T12:26:47Z' }];
    nock('https://api.github.com')
      .get(
        '/repos/github-owner/github-repository/pulls?state=closed&sort=updated&direction=desc&base=toto&per_page=100',
      )
      .reply(200, pullRequests);

    // when
    const response = await githubService.getMergedPullRequestsSortedByDescendingDate(
      'github-owner',
      'github-repository',
      'toto',
    );

    // then
    expect(response).to.deep.equal(pullRequests);
  });
});

describe('#getCommitAtURL', function () {
  it('should call Github "Request" API', async function () {
    // given
    nock('https://commit-url.github.com').get('/').reply(200, {
      commit: 'some data',
    });

    // when
    const response = await githubService.getCommitAtURL('https://commit-url.github.com');

    // then
    expect(response).to.deep.equal('some data');
  });
});

describe('#isBuildStatusOK', function () {
  it('should call Github "branches" API', async function () {
    // given
    const branchName = 'branch-name';
    nock('https://api.github.com')
      .get(`/repos/github-owner/github-repository/branches/${branchName}`)
      .reply(200, {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/commitSHA1',
        },
      });
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/commitSHA1/check-runs')
      .reply(200, {
        check_runs: [{ name: 'build-test-and-deploy', status: 'completed', conclusion: 'success' }],
      });

    // when
    const response = await githubService.isBuildStatusOK({ branchName });

    // then
    expect(response).to.equal(true);
  });

  it('should call Github "tags" API', async function () {
    // given
    const tagName = 'v1.0.9';
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/tags')
      .reply(200, [
        {
          name: 'v1.0.10',
          commit: {
            url: 'https://api.github.com/repos/github-owner/github-repository/commits/v1.0.10SHA1',
          },
        },
        {
          name: 'v1.0.9',
          commit: {
            url: 'https://api.github.com/repos/github-owner/github-repository/commits/v1.0.9SHA1',
          },
        },
      ]);
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/v1.0.9SHA1/check-runs')
      .reply(200, {
        check_runs: [{ name: 'build-test-and-deploy', status: 'completed', conclusion: 'success' }],
      });

    // when
    const response = await githubService.isBuildStatusOK({ tagName });

    // then
    expect(response).to.equal(true);
  });
});

describe('#hasConfigFileChangedSinceLatestRelease', function () {
  const latestReleaseDate = '2020-08-13T04:45:06Z';
  const repoOwner = 'github-owner';
  const repoName = 'github-repository';

  let clock, now;

  beforeEach(function () {
    now = new Date();
    clock = sinon.useFakeTimers(now);
  });

  afterEach(function () {
    clock.restore();
  });

  context('should return true when config file has been changed', function () {
    it('should call Github "commits list" API', async function () {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: latestReleaseDate, until: now.toISOString(), path: 'api/lib/config.js' })
        .reply(200, [
          {
            sha: '5ec2f42',
          },
        ]);

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .reply(200, [{ commit: { url: '/latest_tag_commit_url' } }]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, { commit: { committer: { date: latestReleaseDate } } });

      // when
      const response = await githubService.hasConfigFileChangedSinceLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.true;
    });
  });

  context('should return false when config file did not changed changed', function () {
    it('should call Github "commits list" API', async function () {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: latestReleaseDate, until: now.toISOString(), path: 'api/lib/config.js' })
        .reply(200, []);

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .reply(200, [{ commit: { url: '/latest_tag_commit_url' } }]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, { commit: { committer: { date: latestReleaseDate } } });

      // when
      const response = await githubService.hasConfigFileChangedSinceLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.false;
    });
  });
});

describe('#hasConfigFileChangedInLatestRelease', function () {
  const latestReleaseDate = '2020-08-13T04:45:06Z';
  const secondToLastReleaseDate = '2020-08-10T12:45:06Z';
  const repoOwner = 'github-owner';
  const repoName = 'github-repository';

  context('should return true when config file has been changed', function () {
    it('should call Github "commits list" API', async function () {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: secondToLastReleaseDate, until: latestReleaseDate, path: 'api/lib/config.js' })
        .reply(200, [
          {
            sha: '5ec2f42',
          },
        ]);

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .twice()
        .reply(200, [
          { commit: { url: '/latest_tag_commit_url' } },
          { commit: { url: '/second-to-last_tag_commit_url' } },
        ]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, { commit: { committer: { date: latestReleaseDate } } });

      nock('https://api.github.com')
        .get('/second-to-last_tag_commit_url')
        .reply(200, { commit: { committer: { date: secondToLastReleaseDate } } });

      // when
      const response = await githubService.hasConfigFileChangedInLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.true;
    });
  });

  context('should return false when config file did not changed changed', function () {
    it('should call Github "commits list" API', async function () {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: secondToLastReleaseDate, until: latestReleaseDate, path: 'api/lib/config.js' })
        .reply(200, []);

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .twice()
        .reply(200, [
          { commit: { url: '/latest_tag_commit_url' } },
          { commit: { url: '/second-to-last_tag_commit_url' } },
        ]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, { commit: { committer: { date: latestReleaseDate } } });

      nock('https://api.github.com')
        .get('/second-to-last_tag_commit_url')
        .reply(200, { commit: { committer: { date: secondToLastReleaseDate } } });

      // when
      const response = await githubService.hasConfigFileChangedInLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.false;
    });
  });
});

describe('#getPullRequestsFromCommitsShas', function () {
  it('should return team labels used in PRs associated to commits', async function () {
    // Given
    const repoOwner = 'github-owner';
    const repoName = 'github-repository';
    const commitShas = ['commitSHA1', 'commitSHA2', 'commitSHA3'];
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/commitSHA1/pulls')
      .reply(200, [{ number: 1327, labels: [{ name: 'team-devcomp' }, { name: 'team-prescription' }] }]);

    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/commitSHA2/pulls')
      .reply(200, [{ number: 2438, labels: [{ name: 'team-devcomp' }] }]);

    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/commitSHA3/pulls')
      .reply(200, [{ number: 3569, labels: [] }]);

    // When
    const pullRequests = await githubService.getPullRequestsFromCommitsShas(repoOwner, repoName, commitShas);

    // Then
    const expectedPullRequests = new Map([
      [1327, ['team-devcomp', 'team-prescription']],
      [2438, ['team-devcomp']],
      [3569, []],
    ]);
    expect(pullRequests).to.deep.equal(expectedPullRequests);
  });
});

describe('#verifyWebhookSignature', function () {
  it('return true when the signature match', function () {
    const body = {};
    const request = {
      headers: createGithubWebhookSignatureHeader(JSON.stringify(body)),
      payload: body,
    };
    expect(githubService.verifyWebhookSignature(request)).to.be.true;
  });

  it('return error when the signature dont match', function () {
    const body = {};
    const request = {
      headers: { 'x-hub-signature-256': 'sha256=test' },
      payload: body,
    };

    expect(githubService.verifyWebhookSignature(request).output.payload.message).to.eql(
      'Github signature verification failed. Signature mismatch.',
    );
  });

  it('return error when not signature is present', function () {
    const body = {};
    const request = {
      headers: {},
      payload: body,
    };

    expect(githubService.verifyWebhookSignature(request).output.payload.message).to.eql('Github signature is empty.');
  });
});

describe('#commentPullrequest', function () {
  describe('when everything is OK', function () {
    it('should call GitHub comment API with message', async function () {
      // given
      const body = '# Test \n **awesome comment**';
      const commentNock = nock('https://api.github.com')
        .post('/repos/github-owner/a-repository/issues/0/comments', { body })
        .reply(200);
      const repositoryName = 'a-repository';
      const pullRequestId = 0;
      const comment = '# Test \n **awesome comment**';

      // when
      await githubService.commentPullRequest({ repositoryName, pullRequestId, comment });

      // then
      expect(commentNock.isDone()).to.be.true;
    });
  });
});
