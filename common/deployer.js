const ScalingoClient = require('./services/scalingo-client');

async function fromBranch(repoName, appNames, branch) {
  const client = await ScalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployFromArchive(appName, branch, repoName, { withEnvSuffix: false });
    }),
  );
}

module.exports = { fromBranch };
