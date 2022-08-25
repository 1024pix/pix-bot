//TODO use EnvVars
const config = require('../../config');
const alphanumericAndDashOnly = /^([a-zA-Z0-9]+-)+[a-zA-Z0-9]+$/;
const prefix = 'pix-';
class ScalingoAppName {
  static isApplicationNameValid(applicationName) {
    const suffix = config.scalingo.validAppSuffix;
    const appNameMatchesRegex = applicationName.search(alphanumericAndDashOnly) >= 0;
    const appNameHasCorrectLength = applicationName.length >= 6 && applicationName.length <= 46;
    const appNameStartsWithPix = applicationName.startsWith(prefix);
    const appNameEndsWithCorrectSuffix = suffix.includes(applicationName.split('-').slice(-1)[0]);
    return appNameMatchesRegex && appNameHasCorrectLength && appNameStartsWithPix && appNameEndsWithCorrectSuffix;
  }
}

module.exports = {
  ScalingoAppName,
};
