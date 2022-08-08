const { expect, sinon } = require('../../../test-helper');

const { Tag, Tags } = require('../../../../common/models/Tags');
const PullRequest = require('../../../../common/models/PullRequest');

describe('Unit | Common | Models | PullRequest', function () {
  describe('#constructor', function () {
    it('should create an instance of PullRequest', function () {
      // given
      const properties = {
        html_url: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance).to.be.an.instanceOf(PullRequest);
    });

    it('should have title, number and htmlUrl properties', function () {
      // given
      const properties = {
        html_url: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.htmlUrl).to.equal(properties.html_url);
      expect(createdInstance.number).to.equal(properties.number);
      expect(createdInstance.title).to.equal(properties.title);
    });

    it('should call Tag.getTagByTitle to set tag property', function () {
      // given
      sinon.spy(Tags, 'getTagByTitle');
      const properties = {
        html_url: 'url',
        number: 1,
        title: 'title',
      };

      // when
      new PullRequest(properties);

      // then
      expect(Tags.getTagByTitle).to.have.calledWith(properties.title);
    });

    it('should have a tag property', function () {
      // given
      const properties = {
        html_url: 'url',
        number: 1,
        title: 'title',
      };

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.tag).to.equal(Tag.OTHERS);
    });
  });

  describe('#toString', function () {
    it('should return a string with properties', function () {
      // given
      const html_url = 'https://github.com/1024pix/pix/pull/2971';
      const number = 2971;
      const title = '[FEATURE] Passer les sessions assignées comme sessions "à traiter" (PIX-2571).';
      const properties = { html_url, number, title };

      const expectedString = `- [#${number}](${html_url}) ${title}`;

      // when
      const createdInstance = new PullRequest(properties);

      // then
      expect(createdInstance.toString()).to.equal(expectedString);
    });
  });
});
