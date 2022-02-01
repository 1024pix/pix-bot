const { expect } = require('../../../test-helper');

const { Tag } = require('../../../../scripts/models/Tags');
const PullRequest = require('../../../../scripts/models/PullRequest');
const PullRequestGroup = require('../../../../scripts/models/PullRequestGroup');
const PartialChangeLogGenerator = require('../../../../scripts/models/PartialChangeLogGenerator');

describe('Unit | Script | Models | PartialChangeLogGenerator', () => {

  describe('#constructor', () => {

    it('should create an instance of PartialChangeLogGenerator', () => {
      // given
      const headOfChangelogTitle = '## v3.99.0 (10/09/2021)';
      const pullRequestGroups = [
        new PullRequestGroup({
          tagToGrab: Tag.FEATURE,
          groupTitle: '### :rocket: Amélioration',
        }),
        new PullRequestGroup({
          tagToGrab: Tag.BUGFIX,
          groupTitle: '### :bug: Correction',
        }),
      ];

      // when
      const createdInstance = new PartialChangeLogGenerator({
        headOfChangelogTitle,
        pullRequestGroups,
      });

      // then
      expect(createdInstance).to.be.an.instanceOf(PartialChangeLogGenerator);
      expect(createdInstance.headOfChangelogTitle).to.be.equal(headOfChangelogTitle);
      expect(createdInstance.pullRequestGroups).to.be.equal(pullRequestGroups);
    });
  });

  describe('#grabPullRequestsByTag', () => {

    it('should return an empty array if all Pull Requests are grabbed', () => {
      // given
      const featurePullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      });
      const bugfixPullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      });
      const pullRequestGroups = [featurePullRequestGroup, bugfixPullRequestGroup];

      const partialChangeLogGenerator = new PartialChangeLogGenerator({
        headOfChangelogTitle: '## v3.99.0 (10/09/2021)',
        pullRequestGroups,
      });

      const featurePullRequest = new PullRequest({ title: '[FEATURE] PIX-1' });
      const bugfixPullRequest = new PullRequest({ title: '[BUGFIX] PIX-2' });
      const initialPullRequests = [featurePullRequest, bugfixPullRequest];

      // when
      const result = partialChangeLogGenerator.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.an('array').that.is.empty;
    });

    it('should return the initial Pull Request array if no Pull Request is grabbed', () => {
      // given
      const featurePullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      });
      const bugfixPullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      });
      const pullRequestGroups = [featurePullRequestGroup, bugfixPullRequestGroup];

      const partialChangeLogGenerator = new PartialChangeLogGenerator({
        headOfChangelogTitle: '## v3.99.0 (10/09/2021)',
        pullRequestGroups,
      });

      const techPullRequest = new PullRequest({ title: '[TECH] PIX-3' });
      const initialPullRequests = [techPullRequest];

      // when
      const result = partialChangeLogGenerator.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.an('array').that.is.not.empty;
      expect(result).to.deep.equal(initialPullRequests);
    });

    it('should return the initial Pull Request array minus all Pull Requests grabbed', () => {
      // given
      const featurePullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      });
      const bugfixPullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      });
      const pullRequestGroups = [featurePullRequestGroup, bugfixPullRequestGroup];

      const partialChangeLogGenerator = new PartialChangeLogGenerator({
        headOfChangelogTitle: '## v3.99.0 (10/09/2021)',
        pullRequestGroups,
      });

      const featurePullRequest = new PullRequest({ title: '[FEATURE] PIX-1' });
      const bugfixPullRequest = new PullRequest({ title: '[BUGFIX] PIX-2' });
      const techPullRequest = new PullRequest({ title: '[TECH] PIX-3' });
      const allPullRequests = [featurePullRequest, bugfixPullRequest, techPullRequest];
      const expectedNotGrabbedPullRequests = [techPullRequest];

      // when
      const result = partialChangeLogGenerator.grabPullRequestsByTag(allPullRequests);

      // then
      expect(result).to.an('array').that.is.not.empty;
      expect(result).to.deep.equal(expectedNotGrabbedPullRequests);
    });
  });

  describe('#getLinesToDisplay', () => {

    it('should return empty array if if no Pull Request is grabbed', () => {
      // given
      const featurePullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      });
      const bugfixPullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      });
      const pullRequestGroups = [featurePullRequestGroup, bugfixPullRequestGroup];

      const partialChangeLogGenerator = new PartialChangeLogGenerator({
        headOfChangelogTitle: '## v3.99.0 (10/09/2021)',
        pullRequestGroups,
      });

      // when
      const result = partialChangeLogGenerator.getLinesToDisplay();

      // then
      expect(result).to.an('array').that.is.empty;
    });

    it('should return head of Changelog title and list of Pull Requests grabbed', () => {
      // given
      const headOfChangelogTitle = '## v3.99.0 (10/09/2021)';

      const featurePullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      });
      const bugfixPullRequestGroup = new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      });
      const pullRequestGroups = [featurePullRequestGroup, bugfixPullRequestGroup];

      const partialChangeLogGenerator = new PartialChangeLogGenerator({
        headOfChangelogTitle,
        pullRequestGroups,
      });

      const featurePullRequest = new PullRequest({
        htmlUrl: 'https://github.com/foo/foo/pull/100',
        number: 100,
        title: '[FEATURE] PIX-1',
      });
      const bugfixPullRequest = new PullRequest({
        htmlUrl: 'https://github.com/foo/foo/pull/101',
        number: 101,
        title: '[BUGFIX] PIX-2',
      });
      const pullRequests = [featurePullRequest, bugfixPullRequest];

      partialChangeLogGenerator.grabPullRequestsByTag(pullRequests);
      const expectedLinesToDisplay = [
        headOfChangelogTitle,
        '',
        featurePullRequestGroup.getLinesToDisplay(),
        bugfixPullRequestGroup.getLinesToDisplay(),
      ].flat();

      // when
      const result = partialChangeLogGenerator.getLinesToDisplay();

      // then
      expect(result).to.deep.equal(expectedLinesToDisplay);
    });
  });
});
