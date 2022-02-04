const { expect } = require('../../../test-helper');

const PullRequestGroup = require('../../../../scripts/models/PullRequestGroup');
const { Tag } = require('../../../../scripts/models/Tags');

const PullRequestGroupFactory = require('../../../../scripts/models/PullRequestGroupFactory');

describe('Unit | Script | Models | PullRequestGroupFactory', () => {

  describe('#build', () => {

    it('should return an array of Pull Request Groups', () => {
      // given
      const expectedPullRequestGroups = [
        new PullRequestGroup({
          tagToGrab: Tag.FEATURE,
          groupTitle: '### :rocket: Amélioration',
        }),
        new PullRequestGroup({
          tagToGrab: Tag.TECH,
          groupTitle: '### :building_construction: Tech',
        }),
        new PullRequestGroup({
          tagToGrab: Tag.BUGFIX,
          groupTitle: '### :bug: Correction',
        }),
        new PullRequestGroup({
          tagToGrab: Tag.OTHERS,
          groupTitle: '### :coffee: Autre',
        }),
      ];

      // when
      const result = PullRequestGroupFactory.build();

      // then
      expect(result).to.an('array').that.is.not.empty;
      expect(result).to.deep.equal(expectedPullRequestGroups);
    });
  });

});
