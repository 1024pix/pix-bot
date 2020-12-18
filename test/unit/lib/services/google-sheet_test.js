const { describe, it } = require('mocha');
const { expect } = require('chai');
const { sinon } = require('../../../test-helper');
const axios = require('axios');
const googleSheet = require('../../../../lib/services/google-sheet');

describe('#getA11YTip', function() {
  const data =
        {
          'range': 'tips!A1:E500',
          'majorDimension': 'ROWS',
          'values': [
            [
              'Titre',
              'Sujet',
              'Message',
              'Lien',
              'Tips Pix'
            ],
            [
              'Traduire aussi le contenu masqué',
              'Les langues',
              'Il faut aussi penser à traduire : les attributs `alt`, les `aria-label`, les `title`, les `title` et `desc` des svg, etc.',
              'https://www.accede-web.com/notices/html-css-javascript/3-langues/3-3-veiller-a-traduire-les-contenus-masques/'
            ]
          ]
        }
    ;
  before(() => {
    sinon.stub(axios, 'get').resolves({ data });
  });

  it('should return the response for slack', async function() {
    // given
    const expectedResponse = {
      response_type: 'in_channel',
      'blocks': [
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': ':a11y: Tip A11Y :a11y:'
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `:book: *${data.values[1][0].toUpperCase()}* :book: \n _${data.values[1][1]}_ `
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `${data.values[1][2]} \n :link: : ${data.values[1][3]} \n :pix_logo: : -`
          }
        },
        {
          'type': 'divider'
        }
      ]
    };
    // when
    const response = await googleSheet.getA11YTip('team-certif');

    // then
    expect(response).to.deep.equal(expectedResponse);
  });

});
