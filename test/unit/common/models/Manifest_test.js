const { expect } = require('../../../test-helper');

const { Manifest } = require('../../../../common/models/Manifest');

describe('Unit | Common | Models | Manifest', () => {

  describe('#constructor', () => {

    it('should create an instance of manifest', () => {
      // given
      const manifest = new Manifest('Pix Bot: The return');

      // when
      const name = manifest.name;

      // then
      expect(name).to.be.equal('Pix Bot: The return');
    });
  });

  describe('#registerSlashCommand', () => {
    it('register a slash commands', () => {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      const handler = () => {};

      // when
      manifest.registerSlashCommand({
        command: '/test',
        path: '/command/test',
        description: 'My test command',
        usage_hint: 'this is a test',
        should_escape: false,
        handler,
      });

      // then
      expect(manifest.slashCommands).to.have.lengthOf(1);
      expect(manifest.slashCommands).to.eql([
        {
          command: '/test',
          path: '/command/test',
          description: 'My test command',
          usage_hint: 'this is a test',
          should_escape: false,
          handler,
        }
      ]);
    });
  });

  describe('#getRoutes', () => {
    it('returns the hapi routes', () => {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      const handler = () => {};

      // when
      manifest.registerSlashCommand({
        command: '/test',
        path: '/command/test',
        description: 'My test command',
        usage_hint: 'this is a test',
        should_escape: false,
        handler,
      });

      // then
      expect(manifest.getHapiRoutes()).to.have.lengthOf(1);
      expect(manifest.getHapiRoutes()).to.eql([
        {
          method: 'POST',
          path: '/command/test',
          handler,
        }
      ]);
    });
  });

  describe('#registerShortcut', () => {
    it('register a shortcut', () => {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      // when
      manifest.registerShortcut({
        name: 'Test shortcut',
        type: 'global',
        callback_id: 'test-shortcut',
        description: 'Test description'
      });

      // then
      expect(manifest.shortcuts).to.have.lengthOf(1);
      expect(manifest.shortcuts).to.eql([
        {
          name: 'Test shortcut',
          type: 'global',
          callback_id: 'test-shortcut',
          description: 'Test description'
        }
      ]);
    });
  });
});
