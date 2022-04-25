const github = require('../../common/services/github');
const { environments, deploy, publish } = require('../../common/services/releases');

module.exports = {
  async getPullRequests(request) {
    const label = request.pre.payload.text;
    return github.getPullRequests(label);
  },

  async getChangelogSinceLatestRelease() {
    const prTitlesList = await github.getChangelogSinceLatestRelease();
    return {
      response_type: 'in_channel',
      'text': prTitlesList.join('\n'),
    };
  },

  createAndDeployPixHotfix(request) {
    const payload = request.pre.payload;
    const branchName = payload.text;

    publish('patch', branchName).then(async (latestReleaseTag) => {
      await deploy(environments.recette, latestReleaseTag);
    });

    return {
      'text': 'Commande de déploiement de hotfix de PIX en recette.'
    };
  },
};
