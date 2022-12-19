const { tmpdir } = require('node:os');
const baseDirectory = `${tmpdir()}/pix-bot-test-coverage`;
module.exports = {
  all: true,
  reporter: ['html'],
  include: ['common/**/*.js', 'run/**/*.js', 'build/**/*.js', 'scripts/**/*.js'],
  exclude: ['**/.eslintrc.js', './bin/www'],
  'temp-dir': `${baseDirectory}/tmp`,
  'report-dir': `${baseDirectory}/report`,
};
