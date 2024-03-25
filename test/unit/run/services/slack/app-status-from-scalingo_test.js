import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import ScalingoClient from '../../../../../common/services/scalingo-client.js';
import { getAppStatusFromScalingo } from '../../../../../run/services/slack/app-status-from-scalingo.js';

describe('#getAppStatusFromScalingo', () => {
  it('returns a message when no app is specified in command line', async () => {
    // when
    const response = await getAppStatusFromScalingo();

    // then
    expect(response.text).equals("Un nom d'application est attendu en paramètre (ex: pix-app-production)");
  });

  it('returns a production app status for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-production',
        url: 'https://app.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
    ]);
    sinon.stub(ScalingoClient, 'getInstance').withArgs('production').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('pix-app-production');

    // then
    expect(response).to.deep.equal({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*pix-app-production* 💚 - v1.0.0\n2021-03-24T08:37:18.611Z',
          },
        },
      ],
    });
  });

  it('returns a recette app status for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-recette',
        url: 'https://app.recette.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
    ]);
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('pix-app-recette');

    // then
    expect(response.blocks).is.not.empty;
  });

  it('returns an integration app status for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-integration',
        url: 'https://app.recette.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
    ]);
    sinon.stub(ScalingoClient, 'getInstance').withArgs('integration').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('pix-app-integration');

    // then
    expect(response.blocks).is.not.empty;
    expect(response).to.deep.equal({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*pix-app-integration* 💚\n2021-03-24T08:37:18.611Z',
          },
        },
      ],
    });
  });

  it('returns status for all production apps for slack', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-production',
        url: 'https://app.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
      {
        name: 'pix-api-production',
        url: 'https://api.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-25T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.1.0',
      },
    ]);
    sinon.stub(ScalingoClient, 'getInstance').withArgs('production').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('production');

    // then
    expect(response).to.deep.equal({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*pix-app-production* 💚 - v1.0.0\n2021-03-24T08:37:18.611Z',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*pix-api-production* 💚 - v1.1.0\n2021-03-25T08:37:18.611Z',
          },
        },
      ],
    });
  });

  it('returns a different status message when app is down', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-recette',
        url: 'https://app.recette.pix.fr',
        isUp: false,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
    ]);
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('pix-app-recette');

    // then
    expect(response.blocks[0].text.text).equals('*pix-app-recette* 🛑 - v1.0.0\n2021-03-24T08:37:18.611Z');
  });

  it('returns an error response if an error occured', async () => {
    // given
    const getAppInfo = sinon.stub().rejects(Error('message erreur'));
    sinon.stub(ScalingoClient, 'getInstance').withArgs('recette').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('pix-app-recette');

    // then
    expect(response.text).equals('Une erreur est survenue : "message erreur"');
  });

  it('returns a production app status when the appName is not the full app name', async () => {
    // given
    const getAppInfo = sinon.stub().resolves([
      {
        name: 'pix-app-production',
        url: 'https://app.pix.fr',
        isUp: true,
        lastDeployementAt: '2021-03-24T08:37:18.611Z',
        lastDeployedBy: 'Bob',
        lastDeployedVersion: 'v1.0.0',
      },
    ]);
    const scalingoClientSpy = sinon.stub(ScalingoClient, 'getInstance').resolves({ getAppInfo });

    // when
    const response = await getAppStatusFromScalingo('app');

    // then
    expect(scalingoClientSpy.called).to.equal(true);
    expect(response).to.deep.equal({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*pix-app-production* 💚 - v1.0.0\n2021-03-24T08:37:18.611Z',
          },
        },
      ],
    });
  });
});
