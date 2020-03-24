const crypto = require('crypto');
const querystring = require('querystring');
const config = require('../config');

function _compareSignatures(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function _hashSignature(signature) {
  const prefix = 'v0=';
  const hash = crypto.createHmac('sha256', config.slack.requestSigningSecret).update(signature).digest('HEX');
  return `${prefix}${hash}`;
}

function _isReplayAttack(timestamp) {
  const dateNowInSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(dateNowInSeconds - timestamp) > 60 * 5;
}

module.exports = {

  async verifySlackRequest(request, h) {
    const { headers, payload } = request;
    const slackSignature = headers['x-slack-signature'];
    const timestamp = headers['x-slack-request-timestamp'];

    const payloadString = payload.toString();
    const sigBasestring = `v0:${timestamp}:${payloadString}`;

    if (_isReplayAttack(timestamp)) {
      // TODO define the correct behavior (replay attacks error)
      return h.response().code(500);
    }

    const computedFromHeadersSignature = _hashSignature(sigBasestring);

    if (!_compareSignatures(slackSignature, computedFromHeadersSignature)) {
      return h.response().code(403);
    }

    const payloadJSON = querystring.parse(request.payload.toString());

    return payloadJSON;
  }
};
