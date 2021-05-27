const { expect, sinon } = require('../../../test-helper');

const { Tag, Tags } = require('../../../../scripts/models/Tags');
const PullRequest = require('../../../../scripts/models/PullRequest');

describe('Unit | Script | Models | PullRequest', () => {

  describe('#constructor', () => {

    it('should create an instance of PullRequest', () => {
      // given
      const properties = {
        htmlUrl: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance).to.be.an.instanceOf(PullRequest);
    });

    it('should have title, number and htmlUrl properties', () => {
      // given
      const properties = {
        htmlUrl: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.htmlUrl).to.equal(properties.htmlUrl);
      expect(createdInstance.number).to.equal(properties.number);
      expect(createdInstance.title).to.equal(properties.title);
    });

    it('should call Tag.getTagByTitle to set tag property', () => {
      // given
      sinon.spy(Tags, 'getTagByTitle');
      const properties = {
        htmlUrl: 'url',
        number: 1,
        title: 'title',
      };

      // when
      new PullRequest(properties);

      // then
      expect(Tags.getTagByTitle).to.have.calledWith(properties.title);
    });

    it('should have a tag property', () => {
      // given
      const properties = {
        htmlUrl: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.tag).to.equal(Tag.OTHERS);
    });
  });

  describe('#toString', () => {

    it('should return a string with properties', () => {
      // given
      const htmlUrl = 'https://github.com/1024pix/pix/pull/2971';
      const number = 2971;
      const title = '[FEATURE] Passer les sessions assignées comme sessions "à traiter" (PIX-2571).';
      const properties = { htmlUrl, number, title };

      const expectedString = `- [#${number}](${htmlUrl}) ${title}`;

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.toString()).to.equal(expectedString);
    });
  });
});
