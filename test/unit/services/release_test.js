const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');


describe('release', function() {
    let exec;
    let releaseService;

    before(() => {
        exec = sinon.stub().callsFake(async () => Promise.resolve({stdout: '', stderr: ''}));
        releaseService = proxyquire('../../../lib/services/releases', {
            'child_process': {exec},
            util: {promisify: fn => fn}
        });
    });

    describe('#publish', async function () {
        it('should call the publish script', async function () {
            //when
            await releaseService.publish('minor');

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/publish.sh minor)")));
        });
    });

    describe('#deploy', async function () {
        it('should call the deploy script', async function () {
            //when
            await releaseService.deploy('minor');

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/deploy.sh minor)")));
        });
    });

    describe('#createAndDeployPixSite', async function () {
        it('should call the release pix site script', async function () {
            //when
            await releaseService.createAndDeployPixSite('minor');

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/release-pix-site.sh minor)")));
        });
    });
});
