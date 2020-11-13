const { describe, it } = require('mocha');
const { expect } = require('chai');
const { sinon, nock } = require('../test-helper');
const axios = require('axios');
const githubService = require('../../../lib/services/github');

describe('#getPullRequests', function() {
  const items = [
    { html_url: 'http://test1.fr', title: 'PR1', labels: [ { name: 'team certif'} ]},
    { html_url: 'http://test2.fr', title: 'PR2', labels: [ { name: ':construction: toto'}, { name: ':idea: team certif'}] },
  ];
  beforeEach(() => {
    sinon.stub(axios, 'get').resolves({ data: { items: items } });
  });

  it('should return the response for slack', async function() {
    // given
    const expectedResponse = {
      response_type: 'in_channel',
      text: 'PRs à review pour team-certif',
      attachments: [
        { color: '#B7CEF5', pretext: '', fields: [{ value: ':construction: :idea:<http://test2.fr|PR2>', short: false }] },
        { color: '#B7CEF5', pretext: '', fields: [{ value: '<http://test1.fr|PR1>', short: false }] }
      ]
    };

    // when
    const response = await githubService.getPullRequests('team-certif');

    // then
    expect(response).to.deep.equal(expectedResponse);
  });

  it('should call the Github API with the label without space', async function() {
    // given
    const expectedUrl = 'https://api.github.com/search/issues?q=is:pr+is:open+archived:false+sort:updated-desc+user:1024pix+label:Tech%20Review%20Needed';

    // when
    await githubService.getPullRequests('Tech Review Needed');

    // then
    sinon.assert.calledWith(axios.get, expectedUrl);
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

