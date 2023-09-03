const ScalingoClient = require('./services/scalingo-client');

function fromBranch(repoName, appNames, branch) {
  return async () => {
    const client = await ScalingoClient.getInstance('production');
    return Promise.all(
      appNames.map((appName) => {
        return client.deployFromArchive(appName, branch, repoName, { withEnvSuffix: false });
      }),
    );
  };
}

async function deployTagUsingSCM(appNames, tag) {
  const client = await ScalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployUsingSCM(appName, tag);
    }),
  );
}

module.exports = { fromBranch, deployTagUsingSCM };
