const {
    expect,
    nock,
    catchErr,
    sinon,
  } = require('../../../../test-helper');
const { describe, it } = require('mocha');

const { submitReleaseTagSelection } = require('../../../../../run/services/slack/view-submissions')


describe('#submitReleaseTagSelection', () => {
  const payload = {
    view: {
      state: {
        values: {
          'deploy-release-tag': {
            'release-tag-value': {
              value: '',
            }
          }
        }
      }
    }
  };

  context('when Pix API return a version', function () {
    context('when Github return files and commits', function () {
      it.only('config file was changed', function () {
        // given
        nock('https://api.pix.fr')
          .get('/api')
          .reply(200, { version: "4.37.1" });

        const responseWithoutConfigFile = {
          commits: [
            {
              sha: "3f63810343fa706ef94c915a922ffc88c442e4e6",
            }
          ],
          files: [
            {
              sha: "3f63810343fa706ef94c915a922ffc88c442e4e6",
              filename: "1d/package-lock.json",
              status: "modified",
            },
          ]
        };
  
        nock('https://api.github.com')
          .get('/repos/github-owner/github-repository/compare/v4.37.0...dev')
          .reply(200, responseWithoutConfigFile);

        submitReleaseTagSelection(payload);
      });
    });
  });
});
