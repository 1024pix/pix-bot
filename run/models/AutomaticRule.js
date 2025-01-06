import { config } from '../../config.js';
import { Actions, Attachment, Button, Context, Divider, Message, Section } from 'slack-block-builder';
import dayjs from 'dayjs';

export class AutomaticRule {
  static DISABLE = 'disable-automatic-rule';

  constructor({ ip, ja3, date = dayjs() }) {
    this.ip = ip;
    this.ja3 = ja3;
    this.date = date;
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

    const date = messageObject.attachments[0]?.blocks[2]?.elements[0]?.text?.slice(3);
    if (!date) {
      throw new Error('Date field not found.');
    }

    return new AutomaticRule({ ip, ja3, date: dayjs(date) });
  }

  getInitialMessage({ addedRules }) {
    return this.#buildMessage({ isActive: true, addedRules });
  }

  getDeactivatedMessage() {
    return this.#buildMessage({ isActive: false });
  }

  #buildMessage({ isActive, addedRules }) {
    return {
      channel: `${config.slack.blockedAccessesChannelId}`,
      message: 'Règle de blocage mise en place sur Baleen.',
      attachments: Message()
        .attachments(
          Attachment({ color: '#106c1f' })
            .blocks(
              Section().fields(`IP`, `${this.ip}`),
              Section().fields(`JA3`, `${this.ja3}`),
              Context().elements(`At ${this.date.format('DD/MM/YYYY HH:mm:ss')}`),
              Divider(),
              this.#buildMessageFooter({ isActive, addedRules }),
            )
            .fallback('Règle de blocage mise en place sur Baleen.'),
        )
        .buildToObject().attachments,
    };
  }

  #buildMessageFooter({ isActive, addedRules }) {
    if (isActive) {
      return Actions().elements(
        Button().text('Désactiver').actionId(AutomaticRule.DISABLE).value(JSON.stringify(addedRules)).danger(),
      );
    } else {
      return Section().fields(`Règle désactivée le`, `${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
    }
  }
}
