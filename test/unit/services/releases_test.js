const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');

describe('releases', function() {
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
        it('should call the release pix site script with default', async function () {
            //when
            await releaseService.releaseAndDeployPixSite();

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/release-pix-repo.sh pix-site)")));
        });

        it('should call the release pix site script with \'minor\'', async function () {
            //when
            await releaseService.releaseAndDeployPixSite('minor');

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/release-pix-repo.sh pix-site minor)")));
        });
    });

    describe('#createAndDeployPro', async function () {
        it('should call the release pix pro script with default', async function () {
            //when
            await releaseService.releaseAndDeployPixPro();

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/release-pix-repo.sh pix-pro)")));
        });

        it('should call the release pix pro script with \'minor\'', async function () {
            //when
            await releaseService.releaseAndDeployPixPro('minor');

            // then
            sinon.assert.calledWith(exec, sinon.match(new RegExp(".*(\/scripts\/release-pix-repo.sh pix-pro minor)")));
        });
    });
});
