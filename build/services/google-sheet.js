import axios from 'axios';
import * as _ from 'lodash';

import * as logger from '../../common/services/logger.js';
import settings from '../../config.js';

const URL_SPREADSHEET_API = 'https://sheets.googleapis.com/v4/spreadsheets/';
const SPREADSHEET_VALUES = 'tips!A1:E500';

function getGoogleSheetAPIURL() {
  return `${URL_SPREADSHEET_API}${settings.googleSheet.idA11Y}/values/${SPREADSHEET_VALUES}?key=${settings.googleSheet.key}`;
}

async function getDataFromGoogleSheet() {
  const url = getGoogleSheetAPIURL();
  return axios
    .get(url)
    .then((response) => response.data.values)
    .catch((error) =>
      logger.info({
        event: 'google-sheet',
        message: error,
      }),
    );
}

function createResponseForSlack(tip) {
  const resp = {
    response_type: 'in_channel',
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':a11y: Tip A11Y :a11y:',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:book: *${tip['Titre'].toUpperCase()}* :book: \n _${tip['Sujet']}_ `,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${tip['Message']} \n :link: : ${tip['Lien']} \n :pix_logo: : ${tip['Tips Pix'] || '-'}`,
        },
      },
      {
        type: 'divider',
      },
    ],
  };
  return resp;
}

function getOneRandomTip(tipsFromGoogleSheet) {
  const titles = tipsFromGoogleSheet.shift();
  const randomTip = tipsFromGoogleSheet[Math.floor(Math.random() * tipsFromGoogleSheet.length)];
  return _.zipObject(titles, randomTip);
}
const a11yTip = {
  async getA11YTip() {
    const tipsFromGoogleSheet = await getDataFromGoogleSheet();
    const tip = getOneRandomTip(tipsFromGoogleSheet);
    return createResponseForSlack(tip);
  },
};

export default a11yTip;
