const { slackConfig } = require('../../common/config');
const googleSheet = require('../../build/services/google-sheet');

module.exports = [
  {
    method: 'POST',
    path: '/slack/commands/accessibility-tip',
    handler: googleSheet.getA11YTip,
    config: slackConfig
  },
];
