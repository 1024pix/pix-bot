const { expect } = require('../../../test-helper');

const PullRequest = require('../../../../scripts/models/PullRequest');
const { Tag } = require('../../../../scripts/models/Tags');

const PullRequestGroup = require('../../../../scripts/models/PullRequestGroup');

describe('Unit | Script | Models | PullRequestGroup', () => {

  describe('#constructor', () => {

    it('should not create an instance if parameter tag is not valid', () => {
      // given
      const wrongTag = 'wrongTag';

      // when
      const instantiate = () => new PullRequestGroup(wrongTag);

      // then
      expect(instantiate).to.throw(TypeError);
    });

    it('should create an instance if parameter tag is valid', () => {
      // given
      const validTag = Tag.FEATURE;

      // when
      const createdInstance = new PullRequestGroup(validTag);

      // then
      expect(createdInstance).to.be.an.instanceOf(PullRequestGroup);
      expect(createdInstance.tagToGrab).to.equal(validTag);
      expect(createdInstance.grabbedPullRequests).to.an('array').that.is.empty;
    });
  });

  describe('#grabPullRequestsByTag', () => {

    it('should return the initial PRs array if no PR is grabbed', () => {
      // given
      const featureTag = Tag.FEATURE;
      const pullRequestGroup = new PullRequestGroup(featureTag);
      const initialPullRequests = [new PullRequest({ title: '' })];

      // when
      const result = pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.deep.equal(initialPullRequests);
      expect(pullRequestGroup.grabbedPullRequests).to.an('array').that.is.empty;
    });

    it('should return an empty array if all PRs are grabbed', () => {
      // given
      const featureTag = Tag.FEATURE;
      const pullRequestGroup = new PullRequestGroup(featureTag);
      const initialPullRequests = [
        new PullRequest({ title: '[FEATURE] PIX-1' }),
        new PullRequest({ title: '[FEATURE] PIX-2' })
      ];

      // when
      const result = pullRequestGroup.grabPullRequestsByTag(initialPullRequests);

      // then
      expect(result).to.an('array').that.is.empty;
      expect(pullRequestGroup.grabbedPullRequests).to.deep.equal(initialPullRequests);
    });

    it('should return the initial PRs array minus PRs grabbed', () => {
      // given
      const featureTag = Tag.FEATURE;
      const pullRequestGroup = new PullRequestGroup(featureTag);

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

});
