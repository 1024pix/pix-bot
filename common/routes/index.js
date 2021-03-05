const indexController = require('../controllers');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: indexController.getApiInfo
  }
];
