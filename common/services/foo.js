const { Octokit } = require('@octokit/rest');
const settings = require('../../config');

function _logRequest(message, additionalInfo){
    console.log(message);
}

function _createOctokit() {
  const authCredentials = {};
  if (settings.github.token) {
    authCredentials.auth = "efezfzfze"//settings.github.token;
  }
  return new Octokit({
    ...authCredentials,
    log: {
      debug: ()=>{},
      info: _logRequest,
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
