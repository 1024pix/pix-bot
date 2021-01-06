const axios = require('axios');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const dayjs = require('dayjs');
const config = require('../../config');

function _instanciateSendInBlueTransactionalEmailsAPi() {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications['api-key'].apiKey = config.sendInBlue.apiKey;
  return new SibApiV3Sdk.TransactionalEmailsApi();
}

function _getEmoji(percentage) {
  let emoji = ':vertical_traffic_light:';
  if (percentage >= 50 && percentage < 70) {
    emoji = ':warning:';
  } else if (percentage >= 70) {
    emoji = ':rotating_light:';
  }
  return emoji;
}

function _getColor(percentage) {
  let color = '#5bc0de';
  if (percentage >= 50 && percentage < 70) {
    color = '#f0ad4e';
  } else if (percentage >= 70) {
    color = '#d9534f';
  }
  return color;
}

function _generateAndReturnFilledSlackBlocks({
  requestEmails,
  usagePercentage,
  startDate,
  endDate
}) {
  const emoji = _getEmoji(usagePercentage);
  const color = _getColor(usagePercentage);

  return {
    attachments: [
      {
        mrkdwn_in: ['text'],
        color: color,
        title: 'Usage SendInBlue :mag_right:',
        title_link: 'https://app-smtp.sendinblue.com/statistics',
        text: `Du ${startDate} au ${endDate}`,
        fields: [
          {
            title: 'Nombre d‘e-mails envoyés :',
            value: `${requestEmails}`,
            short: true
          },
          {
            title: 'Quota utilisé :',
            value: `${usagePercentage}% ${emoji}`,
            short: true
          },
        ],
      }
    ]
  };
}

async function getReport() {
  const sendInBlueApi = _instanciateSendInBlueTransactionalEmailsAPi();

  const currentDate = dayjs();
  const firstDayOfThisMonth = dayjs().startOf('month');

  const response = await sendInBlueApi.getAggregatedSmtpReport({
    startDate: firstDayOfThisMonth.format('YYYY-MM-DD'),
    endDate: currentDate.format('YYYY-MM-DD'),
  });

  const requestEmails = response.requests;
  const mailingQuota = config.sendInBlue.mailingQuota;
  const usagePercentage = (requestEmails/mailingQuota * 100).toFixed();
  const blocks = _generateAndReturnFilledSlackBlocks({
    requestEmails: requestEmails.toLocaleString(),
    usagePercentage,
    startDate: firstDayOfThisMonth.format('DD/MM/YYYY'),
    endDate: currentDate.format('DD/MM/YYYY'),
  });

  return axios.post(config.slack.webhookUrlForReporting, blocks, { headers: { 'content-type': 'application/json' } });
}


module.exports = {
  getReport
};

