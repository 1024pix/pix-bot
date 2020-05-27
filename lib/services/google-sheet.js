const axios = require('axios');
const _ = require('lodash');
const settings = require('../config');

function getGoogleSheetAPIURL() {
    return `https://sheets.googleapis.com/v4/spreadsheets/${settings.googleSheet.idA11Y}/values/tips!A1:E500?key=${settings.googleSheet.key}`;
}
async function getDataFromGoogleSheet (label) {
    const url = getGoogleSheetAPIURL();
    return axios.get(url)
        .then(response => {
            return response.data.values;
        })
        .catch(error => {
            console.log(error);
        });
}
function createResponseForSlack(tip) {
    const resp = {
        response_type: 'in_channel',
        "blocks": [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":a11y: Tip A11Y :a11y:"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:book: *${tip['Titre'].toUpperCase()}* :book: \n _${tip['Sujet']}_ `
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${tip['Message']} \n :link: : ${tip['Lien']} \n :pix_logo: : ${tip['Tips Pix'] || '-'}`
                }
            },
            {
                "type": "divider"
            }
        ]
    }
    return resp;
}

function getOneRandomTip(tipsFromGoogleSheet) {
    const titles = tipsFromGoogleSheet.shift();
    const randomTip = tipsFromGoogleSheet[Math.floor(Math.random() * (tipsFromGoogleSheet.length))];
    return _.zipObject(titles, randomTip);
}
module.exports = {

    async getA11YTip() {
        const tipsFromGoogleSheet = await getDataFromGoogleSheet();
        const tip = getOneRandomTip(tipsFromGoogleSheet);
        return createResponseForSlack(tip);
    }
};
