const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

const { getAppStatus } = require('../../../../../run/services/slack/app-status');
const ScalingoClient = require('../../../../../common/services/scalingo-client');

describe('#getAppStatus', () => {

  it('returns a production app status for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves({
      name: 'pix-app-production',
      url: 'https://app.pix.fr',
      isUp: true,
      lastDeployementAt: '2021-03-24T08:37:18.611Z',
      lastDeployedBy: 'Bob',
      lastDeployedVersion: 'v1.0.0',
    });
    sinon.stub(ScalingoClient, 'getInstance').withArgs('production').resolves({ getAppInfo });

    // when
    const response = await getAppStatus('pix-app-production');

    // then
    expect(response).to.deep.equal({
      'response_type': 'in_channel',
      'blocks': [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': '*pix-app-production* is up 💚'
          }
        },
        {
          'type': 'context',
          'elements': [
            {
              'type': 'mrkdwn',
              'text': 'Version *v1.0.0*'
            }
          ]
        },
        {
          'type': 'context',
          'elements': [
            {
              'type': 'mrkdwn',
              'text': 'Deployée par *Bob* à 2021-03-24T08:37:18.611Z.'
            }
          ]
        },
        {
          'type': 'actions',
          'elements': [
            {
              'type': 'button',
              'text': {
                'type': 'plain_text',
                'text': 'Application'
              },
              'url': 'https://app.pix.fr'
            }
          ]
        }
      ]
    });
  });

  it('returns a recette app status for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves({
      name: 'pix-app-recette',
      url: 'https://app.recette.pix.fr',
      isUp: true,
      lastDeployementAt: '2021-03-24T08:37:18.611Z',
      lastDeployedBy: 'Bob',
      lastDeployedVersion: 'v1.0.0',
    });
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatus('pix-app-recette');

    // then
    expect(response.blocks).is.not.empty;
  });

  it('returns a different status message when app is down', async () => {
    // given
    const getAppInfo = sinon.stub().resolves({
      name: 'pix-app-recette',
      url: 'https://app.recette.pix.fr',
      isUp: false,
      lastDeployementAt: '2021-03-24T08:37:18.611Z',
      lastDeployedBy: 'Bob',
      lastDeployedVersion: 'v1.0.0',
    });
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatus('pix-app-recette');

    // then
    expect(response.blocks[0].text.text).equals('*pix-app-recette* is down 🛑');
  });

  it('returns an error response if an error occured', async () => {
    // given
    const getAppInfo = sinon.stub().rejects(Error('message erreur'));
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatus('pix-app-recette');

    // then
    expect(response.text).equals('Une erreur est survenue : "message erreur"');
  });

});
