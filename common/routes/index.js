import indexController from '../controllers';

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

export { routeIndex };
