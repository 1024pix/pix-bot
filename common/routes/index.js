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
];

export default routeIndex;
