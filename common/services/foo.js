const { Octokit } = require('@octokit/rest');
const settings = require('../../config');

function _createOctokit() {
  const authCredentials = {};
  if (settings.github.token) {
    authCredentials.auth = settings.github.token;
  }
  return new Octokit({
    ...authCredentials,
    log: {
      debug: (...args) => {
        console.debug(args[1].method, args[1].url);
      },
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
  });
}
const foo = async () => {
  const { request } = _createOctokit();
  await request('https://github.com/1024pix/pix/commit/54559e4237314365ef3bdd7cb2b7293b0e8b854a');
};

(async () => {
  await foo();
})();
