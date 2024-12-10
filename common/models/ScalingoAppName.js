//TODO use EnvVars
import { config } from '../../config.js';
const alphanumericAndDashOnly = /^([a-zA-Z0-9]+-)+[a-zA-Z0-9]+$/;
const prefix = config.scalingo.validAppPrefix;

class ScalingoAppName {
  static isApplicationNameValid(applicationName) {
    const suffix = config.scalingo.validAppSuffix;
    const appNameMatchesRegex = applicationName.search(alphanumericAndDashOnly) >= 0;
    const appNameHasCorrectLength =
      applicationName.length >= config.scalingo.validAppNbCharMin &&
      applicationName.length <= config.scalingo.validAppNbCharMax;
    const appNameStartsWithPix = applicationName.startsWith(prefix);
    const appNameEndsWithCorrectSuffix = suffix.includes(applicationName.split('-').slice(-1)[0]);
    return appNameMatchesRegex && appNameHasCorrectLength && appNameStartsWithPix && appNameEndsWithCorrectSuffix;
  }

  static isReviewApp(applicationName) {
    return Boolean(applicationName.match(/.*-pr\d+/g));
  }
}

export { ScalingoAppName };
