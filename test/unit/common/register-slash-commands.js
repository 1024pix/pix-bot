const { expect, sinon } = require('../../test-helper');

const { registerSlashCommands } = require('../../../common/register-slash-commands');
const { Manifest } = require('../../../common/models/Manifest');

describe('Unit | Common | register-slack-commands', function () {
  describe('#registerSlashCommand', function () {
    it('registers a slash commands', function () {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      const request = { pre: { payload: { text: 'payload' } } };
      const deployFunctionSpy = sinon.spy();
      const deployFunctionSpyWithPayload = sinon.spy();
      const configuration = [
        {
          slashCommand: {
            command: '/test',
            description: 'My test command',
            usage_hint: 'this is a test',
          },
          slackReturnText: 'Commande de test envoyée',
          deployFunction: deployFunctionSpy,
        },
        {
          slashCommand: {
            command: '/test-with-payload',
            description: 'My test command with payload',
            usage_hint: 'this is a test with payload',
          },
          slackReturnText: 'Commande de test avec payload envoyée',
          deployFunction: deployFunctionSpyWithPayload,
        },
      ];

      // when
      registerSlashCommands(configuration, manifest);

      // then
      expect(manifest.slashCommands).to.have.lengthOf(2);
      expect(manifest.slashCommands[0]).to.include({
        command: '/test',
        path: '/slack/commands/test',
        description: 'My test command',
        usage_hint: 'this is a test',
        should_escape: false,
      });

      const result = manifest.slashCommands[0].handler();
      const resultWithPayload = manifest.slashCommands[1].handler(request);

      expect(deployFunctionSpy).to.have.been.called;
      expect(result).to.eql({ text: 'Commande de test envoyée' });
      expect(deployFunctionSpyWithPayload).to.have.been.calledWith({ text: 'payload' });
      expect(resultWithPayload).to.eql({ text: 'Commande de test avec payload envoyée' });
    });
  });
});
