const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');

describe('releases', function() {
  let exec;
  let releasesService;

  before(() => {
    exec = sinon.stub().callsFake(async () => Promise.resolve({stdout: '', stderr: ''}));
    releasesService = proxyquire('../../../../lib/services/releases', {
      'child_process': {exec},
      util: {promisify: fn => fn}
    });
  });

  describe('#publish', async function () {
    it('should call the publish script', async function () {
      //when
      await releasesService.publish('minor');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/publish.sh minor)')));
    });
  });

  describe('#publishPixRepo', async function () {
    it('should call the release pix script with \'minor\'', async function () {
      //when
      await releasesService.publishPixRepo('pix-site', 'minor');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/release-pix-repo.sh) github-owner pix-site minor$')));
    });
  });

});
