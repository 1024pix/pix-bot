const { expect, sinon } = require('../../test-helper');

const { registerSlashCommands } = require('../../../common/register-slash-commands');
const { Manifest } = require('../../../common/models/Manifest');

describe('Unit | Common | register-slack-commands', function () {
  describe('#registerSlashCommand', function () {
    it('registers a slash commands', function () {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      const deployFunctionSpy = sinon.spy();
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
      ];

      // when
      registerSlashCommands(configuration, manifest);

      // then
      expect(manifest.slashCommands).to.have.lengthOf(1);
      expect(manifest.slashCommands[0]).to.include({
        command: '/test',
        path: '/slack/commands/test',
        description: 'My test command',
        usage_hint: 'this is a test',
        should_escape: false,
      });

      const result = manifest.slashCommands[0].handler();

      expect(deployFunctionSpy).to.have.been.called;
      expect(result).to.eql({ text: 'Commande de test envoyée' });
    });
  });
});
