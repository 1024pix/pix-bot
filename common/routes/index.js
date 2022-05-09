const indexController = require('../controllers');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: indexController.getApiInfo
  },
  {
    method: 'GET',
    path: '/slackviews',
    handler: indexController.getSlackViews
  }
];
