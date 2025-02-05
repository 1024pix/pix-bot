import { config } from '../../config.js';
import { Actions, Attachment, Button, Context, Divider, Message, Section } from 'slack-block-builder';
import dayjs from 'dayjs';

export class AutomaticRule {
  static DISABLE = 'disable-automatic-rule';

  constructor({ ip, ja3, date = dayjs(), rulesId = null }) {
    this.ip = ip;
    this.ja3 = ja3;
    this.date = date;
    this.rulesId = rulesId;
  }

  static parseMessage(message) {
    const messageObject = message;

    const ip = messageObject.attachments[0]?.blocks[0]?.fields[1]?.text;
    if (!ip) {
      throw new Error('IP field not found.');
    }

    const ja3 = messageObject.attachments[0]?.blocks[1]?.fields[1]?.text;
    if (!ja3) {
      throw new Error('JA3 field not found.');
    }

    const ruleIdString = messageObject.attachments[0]?.blocks[2]?.fields[1]?.text;
    if (!ruleIdString) {
      throw new Error('Rules ID field not found.');
    }
    const rulesId = this.#parseRulesIDString(ruleIdString);

    const date = messageObject.attachments[0]?.blocks[3]?.elements[0]?.text?.slice(3);
    if (!date) {
      throw new Error('Date field not found.');
    }

    return new AutomaticRule({ ip, ja3, date: dayjs(date), rulesId });
  }

  static #parseRulesIDString(ruleIdString) {
    const parsedRules = ruleIdString
      .trim()
      .split('\n')
      .map((line) => {
        const [namespaceKey, ruleId] = line.split(': ');
        return { namespaceKey, ruleId };
      });
    return parsedRules;
  }

  getInitialMessage() {
    return this.#buildMessage({ isActive: true });
  }

  getDeactivatedMessage() {
    return this.#buildMessage({ isActive: false });
  }

  #buildRulesIDString() {
    return this.rulesId.map((rule) => `${rule.namespaceKey}: ${rule.ruleId}`).join('\n');
  }

  #buildMessage({ isActive }) {
    const rulesIdString = this.#buildRulesIDString();
    return {
      channel: `${config.slack.blockedAccessesChannelId}`,
      message: 'Règle de blocage mise en place sur Baleen.',
      attachments: Message()
        .attachments(
          Attachment({ color: '#106c1f' })
            .blocks(
              Section().fields(`IP`, `${this.ip}`),
              Section().fields(`JA3`, `${this.ja3}`),
              Section().fields(`Rules`, `${rulesIdString}`), // might be null
              Context().elements(`At ${this.date.format('DD/MM/YYYY HH:mm:ss')}`),
              Divider(),
              this.#buildMessageFooter({ isActive }),
            )
            .fallback('Règle de blocage mise en place sur Baleen.'),
        )
        .buildToObject().attachments,
    };
  }

  #buildMessageFooter({ isActive }) {
    if (isActive) {
      return Actions().elements(
        Button().text('Désactiver').actionId(AutomaticRule.DISABLE).value(JSON.stringify(this.rulesId)).danger(),
      );
    } else {
      return Section().fields(`Règle désactivée le`, `${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
    }
  }
}
