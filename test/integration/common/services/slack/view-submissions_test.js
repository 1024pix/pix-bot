import { expect, sinon } from '../../../../test-helper.js';
import viewSubmissions from '../../../../../run/services/slack/view-submissions.js';
import * as slackGetUserInfos from '../../../../../common/services/slack/surfaces/user-infos/get-user-infos.js';

describe('view-submissions', function () {
  describe('#submitApplicationNameSelection', function () {
    context('when application name is invalid', function () {
      it('should return error message', async function () {
        // given
        const applicationName = 'foo-bar-production';
        const applicationEnvironment = 'production';
        const applicationEnvironmentName = 'production';
        const userId = 1;
        const userEmail = 'john.doe@pix.fr';

        const getUserEmailStub = sinon.stub(slackGetUserInfos, 'getUserEmail');
        getUserEmailStub.resolves(userEmail);

        const payload = {
          view: {
            state: {
              values: {
                'create-app-name': {
                  'scalingo-app-name': {
                    value: applicationName,
                  },
                },
                'application-env': {
                  item: {
                    selected_option: {
                      value: applicationEnvironment,
                      text: {
                        text: applicationEnvironmentName,
                      },
                    },
                  },
                },
              },
            },
          },
          user: { id: userId },
        };

        // when
        const actual = await viewSubmissions.submitApplicationNameSelection(payload);

        // then
        expect(actual).to.deep.equal({
          response_action: 'errors',
          errors: {
            'create-app-name': `foo-bar-production is incorrect, it should start with "pix-" and end with one of the following : production,review,integration,recette,sandbox,dev,router,test. Also the length should be between 6 and 46 characters.`,
          },
        });
      });
    });
    context('when application name is valid', function () {
      it('should return response', async function () {
        // given
        const applicationName = 'pix-foo-production';
        const applicationEnvironment = 'production';
        const applicationEnvironmentName = 'production';
        const userId = 1;
        const userEmail = 'john.doe@pix.fr';

        const getUserEmailStub = sinon.stub(slackGetUserInfos, 'getUserEmail');
        getUserEmailStub.resolves(userEmail);

        const payload = {
          view: {
            state: {
              values: {
                'create-app-name': {
                  'scalingo-app-name': {
                    value: applicationName,
                  },
                },
                'application-env': {
                  item: {
                    selected_option: {
                      value: applicationEnvironment,
                      text: {
                        text: applicationEnvironmentName,
                      },
                    },
                  },
                },
              },
            },
          },
          user: { id: userId },
        };

        // when
        const actual = await viewSubmissions.submitApplicationNameSelection(payload);

        // then
        expect(actual).to.deep.equal({
          response_action: 'push',
          view: {
            blocks: [
              {
                text: {
                  text: "Vous vous apprêtez à créer l'application *pix-foo-production* dans la région : *production* et à inviter cet adresse email en tant que collaborateur : *john.doe@pix.fr*",
                  type: 'mrkdwn',
                },
                type: 'section',
              },
            ],
            callback_id: 'application-creation-confirmation',
            close: {
              text: 'Annuler',
              type: 'plain_text',
            },
            private_metadata:
              '{"applicationName":"pix-foo-production","applicationEnvironment":"production","userEmail":"john.doe@pix.fr"}',
            submit: {
              text: '🚀 Go !',
              type: 'plain_text',
            },
            title: {
              text: 'Confirmation',
              type: 'plain_text',
            },
            type: 'modal',
          },
        });
      });
    });
  });
});
