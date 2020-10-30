const { describe, it } = require('mocha');
const { sinon } = require('../test-helper');

const config = require('../../../lib/config');
const axios = require('axios');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const sendinblueReport = require('../../../lib/services/sendinblue-report');

describe('Unit | SendInBlue Report', () => {
  describe('#getReport', () => {
    let clock;
    const date = new Date('2020-10-08');
    const expectedStartDate = '2020-10-01';
    const expectedEndDate = '2020-10-08';
    const expectedDisplayEndDate = '08/10/2020';
    const expectedDisplayStartDate = '01/10/2020';
    const expectedWebHookUrl = 'https://webhook.slack';
    let getAggregatedSmtpReportStub;
    let axiosStub;

    beforeEach(() => {
      getAggregatedSmtpReportStub = sinon.stub();
      sinon.stub(SibApiV3Sdk, 'TransactionalEmailsApi').returns({
        getAggregatedSmtpReport: getAggregatedSmtpReportStub
      });
      axiosStub = sinon.stub(axios, 'post');
      config.sendInBlue.apiKey = 'SendInBlueApiKey';
      config.sendInBlue.mailingQuota = 3000;
      config.slack.webhookUrlForReporting = expectedWebHookUrl;
      clock = sinon.useFakeTimers(date.getTime());
    });

    afterEach(() => {
      clock.restore();
    });

    it('should call SendInBlue Api with current day and first day of this month', async () => {
      // given
      axiosStub.resolves();
      getAggregatedSmtpReportStub.resolves({ requests: 2020 });

      // when
      await sendinblueReport.getReport();

      // then
      sinon.assert.calledWithExactly(getAggregatedSmtpReportStub, {
        startDate: expectedStartDate,
        endDate: expectedEndDate
      });
    });

    const cases = [
      { when: 'usagePercentage < 50', expectedEmoji: ':vertical_traffic_light:', expectedColor: '#5bc0de', mailingRatio: 4, requestsMails: 1, percentage: 25 },
      { when: 'usagePercentage >= 50 and < 70', expectedEmoji: ':warning:', expectedColor: '#f0ad4e', mailingRatio: 4, requestsMails: 2, percentage: 50 },
      { when: 'usagePercentage >= 70', expectedEmoji: ':rotating_light:', expectedColor: '#d9534f', mailingRatio: 1000000, requestsMails: 700000, percentage: 70 },
    ];

    cases.forEach((testCase) => {
      it(`should post on webhook with slack blocks containing ${testCase.expectedEmoji} emoji when ${testCase.when}`, async () => {
        // given
        axiosStub.resolves();
        getAggregatedSmtpReportStub.resolves({ requests: testCase.requestsMails });
        config.sendInBlue.mailingQuota = testCase.mailingRatio;

        const expectedBlocks = {
          attachments: [
            {
              mrkdwn_in: ['text'],
              color: testCase.expectedColor,
              title: 'Usage SendInBlue :mag_right:',
              title_link: 'https://app-smtp.sendinblue.com/statistics',
              text: `Du ${expectedDisplayStartDate} au ${expectedDisplayEndDate}`,
              fields: [
                {
                  title: 'Nombre d‘e-mails envoyés :',
                  value: `${testCase.requestsMails.toLocaleString()}`,
                  short: true
                },
                {
                  title: 'Quota utilisé :',
                  value: `${testCase.percentage}% ${testCase.expectedEmoji}`,
                  short: true
                },
              ],
            }
          ]
        };

        // when
        await sendinblueReport.getReport();

        // then
        sinon.assert.calledWithExactly(axiosStub, expectedWebHookUrl, expectedBlocks, { headers: { 'content-type': 'application/json' }});
      });
    });
  });
});
