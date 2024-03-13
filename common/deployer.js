import * as ScalingoClient from './services/scalingo-client';

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

export { fromBranch };
