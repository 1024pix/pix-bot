const { expect } = require('../../../test-helper');

const { Tag, Tags } = require('../../../../scripts/models/Tags');

describe('Unit | Script | Models | Tags', () => {

  describe('#getTagByTitle', () => {

    [
      {
        testTitle: 'Tag.BUGFIX if title include [BUGFIX]',
        pullRequestTitle: '[BUGFIX] Pull Request Title',
        expectedTag: Symbol.for('bugfix')
      },
      {
        testTitle: 'Tag.FEATURE if title include [FEATURE]',
        pullRequestTitle: '[FEATURE] Pull Request Title',
        expectedTag: Symbol.for('feature'),
      },
      {
        testTitle: 'Tag.OTHERS if title does not include listed tag',
        pullRequestTitle: '[FIX] Pull Request Title',
        expectedTag: Symbol.for('others'),
      },
      {
        testTitle: 'Tag.QUICK_WIN if title include [QUICK WIN]',
        pullRequestTitle: '[QUICK WIN] Pull Request Title',
        expectedTag: Symbol.for('quickWin'),
      },
      {
        testTitle: 'Tag.TECH if title include [TECH]',
        pullRequestTitle: '[TECH] Pull Request Title',
        expectedTag: Symbol.for('tech'),
      },

    ].forEach((testCase) => {
      it(`should return ${testCase.testTitle}`, () => {
        // when
        const tag = Tags.getTagByTitle(testCase.pullRequestTitle);

        // then
        expect(tag).to.equal(testCase.expectedTag);
      });
    });
  });

  describe('#isValidTag', () => {

    it('should return false if parameter is not a valid Tag', () => {
      // given
      const wrongTag = 'wrongTag';

      // when
      const result = Tags.isValidTag(wrongTag);

      // then
      expect(result).to.be.false;
    });

    it('should return true if parameter is a valid Tag', () => {
      // given
      const validTag = Tag.FEATURE;

      // when
      const result = Tags.isValidTag(validTag);

      // then
      expect(result).to.be.true;
    });
  });
});
