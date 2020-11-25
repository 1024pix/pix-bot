const { expect } = require('chai');
const sinon = require('sinon');
const github = require('../../../lib/services/github');

const { displayPullRequest, filterPullRequest, getHeadOfChangelog, orderPr, getLastMEPDate } = require('../../../scripts/get-pull-requests-to-release-in-prod');

describe('Unit | Script | GET Pull Request to release in Prod', () => {

  describe('displayPullRequest', () => {
    const expectedLine = '- [#111](http://git/111) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).';

    it('should return a line with correct format from correct PR name', () => {
      // given
      const pullRequest = {
        title: '[BUGFIX] Résolution du problème de surestimation du niveau (US-389).',
        number: 111,
        html_url: 'http://git/111'
      };
      // when
      const result = displayPullRequest(pullRequest);
      // then
      expect(result).to.equal(expectedLine);
    });
  });

  describe('filterPullRequest', () => {
    it('should return only merged PR since last MEP', () => {
      // given
      const date = '2019-01-18T15:29:51Z';
      const pullRequests = [{
        'id': 1,
        'number': 315,
        'state': 'closed',
        'title': '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
        'created_at': '2019-01-11T15:47:26Z',
        'updated_at': '2019-01-23T13:37:47Z',
        'closed_at': '2019-01-23T13:37:37Z',
        'merged_at': '2019-01-23T13:37:37Z',
        'assignee': null,
        'milestone': null,
      }, {
        'id': 2,
        'number': 316,
        'state': 'closed',
        'title': '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
        'created_at': '2018-01-11T15:47:26Z',
        'updated_at': '2018-01-23T13:37:47Z',
        'closed_at': '2018-01-23T13:37:37Z',
        'merged_at': '2018-01-23T13:37:37Z',
        'assignee': null,
        'milestone': null,
      }, {
        'id': 3,
        'number': 317,
        'state': 'closed',
        'title': '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
        'created_at': '2019-01-11T15:47:26Z',
        'updated_at': '2019-01-23T13:37:47Z',
        'closed_at': '2019-01-23T13:37:37Z',
        'merged_at': null,
        'assignee': null,
        'milestone': null,
      }];

      // when
      const result = filterPullRequest(pullRequests, date);
      // then
      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(1);
    });
  });

  describe('getHeadOfChangelog', () => {
    it('should return the head of changelog in correct value', () => {
      // given
      sinon.useFakeTimers();
      const headChangelog = '## v2.0.0 (01/01/1970)\n';
      const versionNumber = '2.0.0';
      // when
      const result = getHeadOfChangelog(versionNumber);
      // then
      expect(result).to.equal(headChangelog);
    });
  });

  describe('orderPr', () => {
    it('should order PR by type', () => {
      // given
      const pullRequests = [
        { title: '[BUGFIX] TEST' },
        { title: '[QUICK WIN] TEST' },
        { title: 'TEST' },
        { title: '[FEATURE] TEST' },
        { title: '[TECH] TEST' },
      ];
      // when
      const result = orderPr(pullRequests);
      // then
      expect(result[0].title).to.equal('[FEATURE] TEST');
      expect(result[1].title).to.equal('[QUICK WIN] TEST');
      expect(result[2].title).to.equal('[BUGFIX] TEST');
      expect(result[3].title).to.equal('[TECH] TEST');
      expect(result[4].title).to.equal('TEST');
    });
  });

  describe('getLastMEPDate', () => {
    const repoOwner = '1024pix';
    const repoName = 'pix';

    beforeEach(() => {
      sinon.stub(github, 'getLatestReleaseTagUrl')
        .withArgs(repoOwner, repoName)
        .resolves(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/4c3ad3d377c37023e835ad674578cf06fcb4de7a`);

      sinon.stub(github, 'getCommitAtURL')
        .withArgs(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/4c3ad3d377c37023e835ad674578cf06fcb4de7a`)
        .resolves({ committer: { date: '2019-01-18T15:29:51Z' } });
    });

    it('should return the date of the last MEP commit', async () => {
      // given
      const expectedDate = '2019-01-18T15:29:51Z';
      // when
      const date = await getLastMEPDate(repoOwner, repoName);
      // then
      expect(date).to.be.equal(expectedDate);
    });
  });

});
