const metabaseController = require('../controllers/metabase');

module.exports = [
  {
    method: 'POST',
    path: '/run/metabase/duplicate',
    handler: metabaseController.duplicate,
  },
];
