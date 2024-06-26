import PullRequest from '../../../../common/models/PullRequest.js';
import PullRequestGroup from '../../../../common/models/PullRequestGroup.js';
import { Tag } from '../../../../common/models/Tags.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Common | Models | PullRequestGroup', function () {
  describe('#constructor', function () {
    it('should not create an instance if parameter tag to grab is not valid', function () {
      // given
      const wrongTag = 'wrongTag';
      const groupTitle = '### :bug: Correction';

      // when
      const instantiate = () => new PullRequestGroup({ tagToGrab: wrongTag, groupTitle });

      // then
      expect(instantiate).to.throw(TypeError);
    });

    it('should create an instance if parameter tag is valid', function () {
      // given
      const validTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';

      // when
      const createdInstance = new PullRequestGroup({ tagToGrab: validTag, groupTitle });

      // then
      expect(createdInstance).to.be.an.instanceOf(PullRequestGroup);
      expect(createdInstance.groupTitle).to.equal(groupTitle);
      expect(createdInstance.tagToGrab).to.equal(validTag);
      expect(createdInstance.grabbedPullRequests).to.an('array').that.is.empty;
    });
  });

  describe('#grabPullRequestsByTag', function () {
    it('should return the initial Pull Request array if no Pull Request is grabbed', function () {
      // given
      const featureTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';
      const pullRequestGroup = new PullRequestGroup({ tagToGrab: featureTag, groupTitle });
      const initialPullRequests = [new PullRequest({ title: '' })];

      // when
      const result = pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.deep.equal(initialPullRequests);
      expect(pullRequestGroup.grabbedPullRequests).to.an('array').that.is.empty;
    });

    it('should return an empty array if all Pull Requests are grabbed', function () {
      // given
      const featureTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';
      const pullRequestGroup = new PullRequestGroup({ tagToGrab: featureTag, groupTitle });

      const initialPullRequests = [
        new PullRequest({ title: '[FEATURE] PIX-1' }),
        new PullRequest({ title: '[FEATURE] PIX-2' }),
      ];

      // when
      const result = pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.an('array').that.is.empty;
      expect(pullRequestGroup.grabbedPullRequests).to.deep.equal(initialPullRequests);
    });

    it('should return the initial Pull Requests array minus Pull Requests grabbed', function () {
      // given
      const featureTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';
      const pullRequestGroup = new PullRequestGroup({ tagToGrab: featureTag, groupTitle });

      const featurePullRequest = new PullRequest({ title: '[FEATURE] PIX-1' });
      const techPullRequest = new PullRequest({ title: '[TECH] PIX-2' });
      const initialPullRequests = [featurePullRequest, techPullRequest];

      const expectedgrabbedPullRequests = [featurePullRequest];
      const expectedResult = [techPullRequest];

      // when
      const result = pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(pullRequestGroup.grabbedPullRequests).to.deep.equal(expectedgrabbedPullRequests);
    });
  });

  describe('#getLinesToDisplay', function () {
    it('should return empty array if if no Pull Request is grabbed', function () {
      // given
      const featureTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';
      const pullRequestGroup = new PullRequestGroup({ tagToGrab: featureTag, groupTitle });

      // when
      const result = pullRequestGroup.getLinesToDisplay();

      // then
      expect(result).to.an('array').that.is.empty;
    });

    it('should return group title and list of Pull Requests grabbed', function () {
      // given
      const featureTag = Tag.FEATURE;
      const groupTitle = '### :rocket: Amélioration';
      const pullRequestGroup = new PullRequestGroup({ tagToGrab: featureTag, groupTitle });

      const featurePullRequest = new PullRequest({
        htmlUrl: 'https://github.com/foo/foo/pull/100',
        number: 100,
        title: '[FEATURE] PIX-1',
      });
      const techPullRequest = new PullRequest({ title: '[TECH] PIX-2' });
      const initialPullRequests = [featurePullRequest, techPullRequest];
      pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      const expectedLinesToDisplay = [groupTitle, featurePullRequest.toString(), ''];

      // when
      const result = pullRequestGroup.getLinesToDisplay();

      // then
      expect(result).to.deep.equal(expectedLinesToDisplay);
    });
  });
});
