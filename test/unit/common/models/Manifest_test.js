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

  describe('#addInteractivity', () => {
    it('add interactivity url', () => {
      // given
      const manifest = new Manifest('Pix Bot: The return');
      const handler = () => {};

      // when
      manifest.addInteractivity({
        path: '/test-url',
        handler
      });

      // then
      expect(manifest.interactivity).to.eql({
        path: '/test-url',
        handler
      });
    });
  });

  describe('#getRoutes', () => {
    let manifest;

    beforeEach(() => {
      manifest = new Manifest('Pix Bot: The return');
    });

    it('returns the hapi routes for slash commands', () => {
      // given
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

    it('returns the hapi routes for interactivity', () => {
      // given
      const handler = () => {};

      // when
      manifest.addInteractivity({
        path: '/command/interactivity',
        handler,
      });

      // then
      expect(manifest.getHapiRoutes()).to.have.lengthOf(1);
      expect(manifest.getHapiRoutes()).to.eql([
        {
          method: 'POST',
          path: '/command/interactivity',
          handler,
        }
      ]);
    });

    it('returns the hapi routes for slash commands and interactivity', () => {
      // given
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
      manifest.addInteractivity({
        path: '/command/interactivity',
        handler,
      });

      // then
      expect(manifest.getHapiRoutes()).to.have.lengthOf(2);
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
