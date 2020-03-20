const indexController = require('../controllers/index');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: indexController.getApiInfo
  }
];
