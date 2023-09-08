const logger = require('../../../common/services/logger');
const ScalingoClient = require('../../../common/services/scalingo-client');

async function taskAutoScaleWeb(
  { applicationName, region, autoScalingParameters },
  injectedScalingoClient = ScalingoClient,
) {
  logger.info({
    event: 'scalingo-autoscaler',
    message: `Starting autoscaling for ${applicationName} with min: ${autoScalingParameters.min} and max: ${autoScalingParameters.max}`,
  });
  try {
    const client = await injectedScalingoClient.getInstance(region);
    await client.updateAutoscaler(applicationName, autoScalingParameters);
    logger.info({
      event: 'scalingo-autoscaler',
      message: `${applicationName} has been austocaled with sucess to min: ${autoScalingParameters.min} and max: ${autoScalingParameters.max}`,
    });
  } catch (error) {
    throw new Error(`Scalingo APIError: ${error.message}`);
  }
}

module.exports = { run: taskAutoScaleWeb };
