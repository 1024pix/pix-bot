const { describe, it } = require('mocha');
const { expect } = require('chai');
const releasesService = require('../../../../common/services/releases');

describe('releases', function() {

  describe('#_runScriptWithArgument', async function() {
    it('should execute and return last line of script output', async function() {
      // when
      const lastLine = await releasesService._runScriptWithArgument('dummy-script.sh');

      // then
      expect(lastLine).to.equal('OK');
    });
  });
});


