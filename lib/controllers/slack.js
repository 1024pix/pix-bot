const { deploy } = require('../services/releases');
const crypto = require('crypto');

module.exports = {

  test(request, h) {
    const payload = request.payload;

    console.log(payload);

    return {
      "response_type": "in_channel",
      "text": "It works!"
    };
  },

  async deployRelease(request, h) {
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

    if (_compareSignatures(slackSignature, computedFromHeadersSignature)) {
      await deploy();
    } else {
      return h.response().code(403);
    }

    return {
      "response_type": "in_channel",
      "text": "Release deployed 🚀!"
    };
  },

};

function _compareSignatures(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function _hashSignature(signature) {
  const prefix = 'v0=';
  const hash = crypto.createHmac('sha256', process.env.SLACK_RELEASE_MANAGER_SIGNING_SECRET).update(signature).digest('HEX');
  return `${prefix}${hash}`;
}

function _isReplayAttack(timestamp) {
  const dateNowInSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(dateNowInSeconds - timestamp) > 60 * 5;
}
