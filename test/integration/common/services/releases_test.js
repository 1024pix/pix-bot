import { expect } from 'chai';
import { describe, it } from 'mocha';

import releasesService from '../../../../common/services/releases.js';

describe('releases', function () {
  describe('#_runScriptWithArgument', function () {
    it('should execute and return last line of script output', async function () {
      // when
      const lastLine = await releasesService._runScriptWithArgument('dummy-script.sh');

      // then
      expect(lastLine).to.equal('OK');
    });
  });
});
