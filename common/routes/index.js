import indexController from '../controllers/index.js';

const routeIndex = [
  {
    method: 'GET',
    path: '/',
    handler: indexController.getApiInfo,
  },
  {
    method: 'GET',
    path: '/slackviews',
    handler: indexController.getSlackViews,
  },
  {
    method: 'POST',
    path: '/deployment-succeeded',
    handler: indexController.newAppDeployed,
  },
];

export default routeIndex;
