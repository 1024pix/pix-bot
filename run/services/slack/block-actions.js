import cdnService from '../cdn.js';
import { AutomaticRule } from '../../models/AutomaticRule.js';
import slackService from '../../../common/services/slack/surfaces/messages/update-message.js';

const blockActions = {
  async disableAutomaticRule(payload) {
    const rules = JSON.parse(payload.actions[0].value);
    const messageTimestamp = payload.message.ts;

    for (const rule of rules) {
      await cdnService.disableRule(rule);
    }

    const automaticRule = AutomaticRule.parseMessage(payload.message);
    await slackService.updateMessage({ ts: messageTimestamp, ...automaticRule.getDeactivatedMessage() });

    return 'Automatic rule disabled.';
  },
};

export default blockActions;
