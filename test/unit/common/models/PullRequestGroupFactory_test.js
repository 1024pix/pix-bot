import { expect } from '../../../test-helper';

import * as PullRequestGroup from '../../../../common/models/PullRequestGroup';
import { Tag } from '../../../../common/models/Tags';

import * as PullRequestGroupFactory from '../../../../common/models/PullRequestGroupFactory';

describe('Unit | Common | Models | PullRequestGroupFactory', function () {
  describe('#build', function () {
    it('should return an array of Pull Request Groups', function () {
      // given
      const expectedPullRequestGroups = [
        new PullRequestGroup({
          tagToGrab: Tag.BREAKING,
          groupTitle: '### :boom: BREAKING CHANGE',
        }),
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
          tagToGrab: Tag.BUMP,
          groupTitle: '### :arrow_up: Montée de version',
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
