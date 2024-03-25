import * as crypto from 'crypto';
import * as querystring from 'querystring';
import * as tsscmp from 'tsscmp';
import * as Boom from '@hapi/boom';
import config from '../../../config.js';
import * as logger from '../logger.js';

function verifyRequestSignature(signingSecret, body, signature, requestTimestamp) {
  if (signature === undefined || requestTimestamp === undefined) {
    throw Boom.unauthorized('Slack request signing verification failed. Some headers are missing.');
  }

  const ts = Number(requestTimestamp);
  if (isNaN(ts)) {
    throw Boom.unauthorized('Slack request signing verification failed. Timestamp is invalid.');
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

  if (ts < fiveMinutesAgo) {
    throw Boom.unauthorized('Slack request signing verification failed. Timestamp is too old.');
  }

  const hmac = crypto.createHmac('sha256', config.slack.requestSigningSecret);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw Boom.unauthorized('Slack request signing verification failed. Signature mismatch.');
  }
}

function parseRequestBody(stringBody, contentType) {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(stringBody);
    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }
    return parsedBody;
  }

  if (contentType === 'application/json') {
    return JSON.parse(stringBody);
  }

  logger.warn({ event: 'security', message: `Unexpected content-type detected: ${contentType}` });
  try {
    // Parse this body anyway
    return JSON.parse(stringBody);
  } catch (error) {
    logger.error({ event: 'security', message: `Failed to parse body as JSON data for content-type: ${contentType}` });
    throw error;
  }
}

async function verifySignatureAndParseBody(request) {
  const { headers, payload } = request;

  const signingSecret = config.slack.requestSigningSecret;
  const signature = headers['x-slack-signature'];
  const requestTimestamp = headers['x-slack-request-timestamp'];
  const contentType = headers['content-type'];
  const stringBody = payload ? payload.toString() : '';

  try {
    verifyRequestSignature(signingSecret, stringBody, signature, requestTimestamp);
  } catch (error) {
    return error;
  }

  return parseRequestBody(stringBody, contentType);
}

export { verifySignatureAndParseBody };
