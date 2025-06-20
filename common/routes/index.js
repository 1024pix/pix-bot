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
    path: '/api/application/deployed',
    handler: indexController.applicationIsDeployed,
  },
];

export default routeIndex;
