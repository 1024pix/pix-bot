import * as deployments from '../../../../common/repositories/deployments.repository.js';
import { expect } from '../../../test-helper.js';
import { knex } from '../../../../db/knex-database-connection.js';

describe('Integration | Common | Repository | Deployments', function () {
  beforeEach(async function () {
    await knex('deployments').delete();
  });

  describe('#isFromMonorepo', function () {
    it('should return true if app name is from table', async function () {
      // given
      const appName = 'pix-app';

      // when
      const result = await deployments.isFromMonoRepo(appName);

      // then
      expect(result).to.be.true;
    });

    it('should return false if app name is not from table', async function () {
      // given
      const appName = 'non-existing-app';

      // when
      const result = await deployments.isFromMonoRepo(appName);

      // then
      expect(result).to.be.false;
    });
  });

  describe('#addDeployment', function () {
    it('should toggle the variable for app and not create tag', async function () {
      // given
      await knex('deployments').insert({ tag: 'V1.0.0' });

      // when
      await deployments.addDeployment({ tag: 'V1.0.0', app: 'pix-app' });

      // then
      const apps = await knex('deployments').where({ tag: 'V1.0.0' }).first();
      expect(apps['pix-app']).to.be.true;
    });
  });

  describe('#createTag', function () {
    it('should create a tag', async function () {
      // when
      await deployments.createTag('V1.0.0');

      // then
      const tag = await knex('deployments').where({ tag: 'V1.0.0' }).first();
      expect(tag).to.exist;
    });
  });

  describe('#removedeployments', function () {
    it('should remove deployments by tag', async function () {
      // given
      await knex('deployments').insert({ tag: 'V1.0.0', 'pix-app': true });

      // when
      await deployments.removedeployments('V1.0.0');

      // then
      const tag = await knex('deployments').where({ tag: 'V1.0.0' }).first();
      expect(tag).to.be.undefined;
    });
  });

  describe('#getAppStateByTag', function () {
    it('should return the app state by tag', async function () {
      // given
      await knex('deployments').insert({ tag: 'V1.0.0', 'pix-app': true, 'pix-orga': false });

      // when
      const result = await deployments.getAppStateByTag('V1.0.0');

      // then
      expect(result).to.exist;
      expect(result['pix-app']).to.be.true;
      expect(result['pix-orga']).to.be.false;
    });
  });
});
