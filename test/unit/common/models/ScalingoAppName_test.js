import { ScalingoAppName } from '../../../../common/models/ScalingoAppName.js';
import { expect } from '../../../test-helper.js';

/* eslint no-console: off */

describe('Unit | Common | Models | ScalingoAppName', function () {
  describe('#isApplicationNameValid', function () {
    it('should return false if appName contains non alphanum or dash char', function () {
      // given
      const invalidAppName = 'pix#-application-nameat-production';

      // when
      const resultInvalidAppName = ScalingoAppName.isApplicationNameValid(invalidAppName);
      console.log(resultInvalidAppName);
      // then
      expect(resultInvalidAppName, 'Invalid app name').to.be.false;
    });

    it('should return false if appName does not start with pix', function () {
      // given
      const doesNotStartWithPixAppName = 'app-name-format';

      // when
      const resultDoesNotStartWithPixAppName = ScalingoAppName.isApplicationNameValid(doesNotStartWithPixAppName);

      // then
      expect(resultDoesNotStartWithPixAppName, 'Does not start with pix app name').to.be.false;
    });

    it('should return false if appName is too short', function () {
      // given
      const tooShortAppName = 'pix-a';

      // when
      const resultTooShortAppName = ScalingoAppName.isApplicationNameValid(tooShortAppName);

      // then
      expect(resultTooShortAppName, 'Too short app name').to.be.false;
    });

    it('should return false if appName is too long', function () {
      // given
      const tooLongAppName = 'pix-application-with-a-long-name-that-does-not-fit-production';

      // when
      const resultTooLongAppName = ScalingoAppName.isApplicationNameValid(tooLongAppName);

      // then
      expect(resultTooLongAppName, 'Too long app name').to.be.false;
    });

    it('should return false if appName end with incorrect suffix', function () {
      // given
      const incorrectSuffixAppName = 'pix-coucou-app-name-mauvaissuffix';

      // when
      const resultIncorrectSuffixAppName = ScalingoAppName.isApplicationNameValid(incorrectSuffixAppName);

      // then
      expect(resultIncorrectSuffixAppName, 'Incorrect suffix app name').to.be.false;
    });

    it('should return true if parameter is a valid appName', function () {
      // given
      const validAppName = 'pix-super-application-recette';

      // when
      const result = ScalingoAppName.isApplicationNameValid(validAppName);

      // then
      expect(result).to.be.true;
    });
  });
});
