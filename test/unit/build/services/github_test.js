const { describe, it } = require('mocha');
const { expect } = require('chai');
const { nock, createGithubWebhookSignatureHeader } = require('../../../test-helper');
const githubService = require('../../../../common/services/github');

describe('#getPullRequests', function() {

  it('should return the response for slack', async function() {
    // given
    const items = [
      { html_url: 'http://test1.fr', number: 0, title: 'PR1', labels: [ { name: 'team certif'} ]},
      { html_url: 'http://test2.fr', number: 1, title: 'PR2', labels: [ { name: ':construction: toto'}, { name: ':idea: team certif'}] },
    ];

    nock('https://api.github.com')
      .get('/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+user%3Agithub-owner+label%3Ateam-certif&sort=updated&order=desc')
      .reply(200, {items});

    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/0/reviews')
      .reply(200, [{state: 'COMMENTED'}, {state: 'APPROVED'}]);
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/1/reviews')
      .reply(200, [{state: 'CHANGES_REQUESTED'}]);

    const expectedResponse = {
      response_type: 'in_channel',
      text: 'PRs à review pour team-certif',
      attachments: [
        { color: '#B7CEF5', pretext: '', fields: [{ value: '💬x1 ✅x1 | <http://test1.fr|PR1>', short: false }] },
        { color: '#B7CEF5', pretext: '', fields: [{ value: '❌x1 | :construction: :idea: | <http://test2.fr|PR2>', short: false }] },
      ]
    };

    // when
    const response = await githubService.getPullRequests('team-certif');

    // then
    expect(response).to.deep.equal(expectedResponse);
  });

  it('should call the Github API with the label without space', async function() {
    // given
    let scopePr, scopeReview;
    const items = [
      { html_url: 'http://test1.fr', number: 0, title: 'PR1', labels: [ { name: 'team certif'} ]},
    ];
    scopePr = nock('https://api.github.com')
      .get('/search/issues?q=is%3Apr+is%3Aopen+archived%3Afalse+user%3Agithub-owner+label%3ATech%2520Review%2520Needed&sort=updated&order=desc')
      .reply(200, {items});

    scopeReview = nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls/0/reviews')
      .reply(200, []);

    // when
    await githubService.getPullRequests('Tech Review Needed');

    // then
    expect(scopePr.isDone());
    expect(scopeReview.isDone());
  });

});

describe('#getLatestReleaseTag', () => {

  it('should call GitHub "Tags" API', async () => {
    // given
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/tags')
      .reply(200, [
        { 'name': 'v2.171.0', },
        { 'name': 'v2.170.0', },
      ]);

    // when
    const response = await githubService.getLatestReleaseTag();

    // then
    expect(response).to.equal('v2.171.0');
  });

  it('should call GitHub "Tags" API for the given repository', async () => {
    // given
    nock('https://api.github.com')
      .get('/repos/github-owner/given-repository/tags')
      .reply(200, [
        { 'name': 'v2.171.0', },
        { 'name': 'v2.170.0', },
      ]);

    // when
    const response = await githubService.getLatestReleaseTag('given-repository');

    // then
    expect(response).to.equal('v2.171.0');
  });

});

describe('#getChangelogSinceLatestRelease', () => {

  it('should return the list of PR titles since latest release', async () => {
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
        {commit: {url: '/latest_tag_commit_url'},},
        {commit: {url: '/some_tag_commit_url'},},
        {commit: {url: '/some_other_tag_commit_url'},},
      ]);
    nock('https://api.github.com')
      .get('/latest_tag_commit_url')
      .reply(200, {commit: {committer: {date: latestTagDate}}});
    nock('https://api.github.com')
      .get(`/repos/${repoOwner}/${repoName}`)
      .reply(200, {default_branch: 'my_default_branch'});
    nock('https://api.github.com')
      .get(`/repos/${repoOwner}/${repoName}/pulls`)
      .query({
        base: 'my_default_branch',
        state: 'closed',
        sort: 'updated',
        direction: 'desc'
      })
      .reply(200, [
        {merged_at: afterTag1Date, title: 'PR Protéines'},
        {merged_at: afterTag2Date, title: 'PR Légumes'},
        {merged_at: beforeTagDate, title: 'PR Fruit'},
      ]);

    // when
    const response = await githubService.getChangelogSinceLatestRelease(repoOwner, repoName);

    // then
    expect(response).to.deep.equal(['PR Protéines', 'PR Légumes']);
  });

});

describe('#getMergedPullRequestsSortedByDescendingDate', () => {

  it('should call GitHub "Pulls" API', async () => {
    // given
    const pullRequests = [
      { merged_at: '2020-09-02T12:26:47Z' },
      { merged_at: '2020-09-01T12:26:47Z' }
    ];
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository')
      .reply(200, { default_branch: 'dev' });
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls?state=closed&sort=updated&direction=desc&base=dev')
      .reply(200, pullRequests);

    // when
    const response = await githubService.getMergedPullRequestsSortedByDescendingDate('github-owner', 'github-repository');

    // then
    expect(response).to.deep.equal(pullRequests);
  });

  it('should call GitHub "Pulls" API with given branch name', async () => {
    // given
    const pullRequests = [
      { merged_at: '2020-09-02T12:26:47Z' },
      { merged_at: '2020-09-01T12:26:47Z' }
    ];
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/pulls?state=closed&sort=updated&direction=desc&base=toto')
      .reply(200, pullRequests);

    // when
    const response = await githubService.getMergedPullRequestsSortedByDescendingDate('github-owner', 'github-repository', 'toto');

    // then
    expect(response).to.deep.equal(pullRequests);
  });

});

describe('#getCommitAtURL', () => {

  it('should call Github "Request" API', async () => {
    // given
    nock('https://commit-url.github.com')
      .get('/')
      .reply(200, {
        commit: 'some data'
      });

    // when
    const response = await githubService.getCommitAtURL('https://commit-url.github.com');

    // then
    expect(response).to.deep.equal('some data');

  });
});

describe('#isBuildStatusOK', () => {

  it('should call Github "branches" API', async () => {
    // given
    const branchName = 'branch-name';
    nock('https://api.github.com')
      .get(`/repos/github-owner/github-repository/branches/${branchName}`)
      .reply(200, {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/commitSHA1'
        }
      });
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/commitSHA1/check-runs')
      .reply(200, {
        'check_runs': [{ name: 'build-test-and-deploy', status: 'completed', conclusion: 'success' }]
      });

    // when
    const response = await githubService.isBuildStatusOK({ branchName });

    // then
    expect(response).to.equal(true);

  });

  it('should call Github "tags" API', async () => {
    // given
    const tagName = 'v1.0.9';
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/tags')
      .reply(200, [{
        name: 'v1.0.10',
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/v1.0.10SHA1'
        },
      }, {
        name: 'v1.0.9',
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/v1.0.9SHA1'
        },
      }]);
    nock('https://api.github.com')
      .get('/repos/github-owner/github-repository/commits/v1.0.9SHA1/check-runs')
      .reply(200, {
        'check_runs': [{ name: 'build-test-and-deploy', status: 'completed', conclusion: 'success' }]
      });

    // when
    const response = await githubService.isBuildStatusOK({ tagName });

    // then
    expect(response).to.equal(true);
  });
});

describe('#hasConfigFileChangedSinceLatestRelease', () => {
  const latestReleaseDate= '2020-08-13T04:45:06Z';
  const repoOwner = 'github-owner';
  const repoName = 'github-repository';

  context('should return true when config file has been changed', ()=> {
    it('should call Github "commits list" API', async () => {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: latestReleaseDate, path: 'api/lib/config.js' })
        .reply(200,
          [{
            sha: '5ec2f42',
          }]
        );

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .reply(200, [{commit: {url: '/latest_tag_commit_url',},}]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, {commit: {committer: {date: latestReleaseDate}}});

      // when
      const response = await githubService.hasConfigFileChangedSinceLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.true;
    });
  });

  context('should return false when config file did not changed changed', ()=> {
    it('should call Github "commits list" API', async () => {
      // given
      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/commits')
        .query({ since: latestReleaseDate, path: 'api/lib/config.js' })
        .reply(200,
          []
        );

      nock('https://api.github.com')
        .get('/repos/github-owner/github-repository/tags')
        .reply(200, [{commit: {url: '/latest_tag_commit_url',},}]);

      nock('https://api.github.com')
        .get('/latest_tag_commit_url')
        .reply(200, {commit: {committer: {date: latestReleaseDate}}});

      // when
      const response = await githubService.hasConfigFileChangedSinceLatestRelease(repoOwner, repoName);
      // then
      expect(response).to.be.false;
    });
  });
});

describe('#verifyWebhookSignature', function() {
  it('return true when the signature match', function() {
    const body = {};
    const request = {
      headers: createGithubWebhookSignatureHeader(JSON.stringify(body)),
      payload: body,
    };
    expect(githubService.verifyWebhookSignature(request)).to.be.true;
  });

  it('return error when the signature dont match', function() {
    const body = {};
    const request = {
      headers: { 'x-hub-signature-256': 'sha256=test' },
      payload: body,
    };

    expect(githubService.verifyWebhookSignature(request).output.payload.message).to.eql('Github signature verification failed. Signature mismatch.');
  });

  it('return error when not signature is present', function() {
    const body = {};
    const request = {
      headers: {},
      payload: body,
    };

    expect(githubService.verifyWebhookSignature(request).output.payload.message).to.eql('Github signature is empty.');
  });
});
