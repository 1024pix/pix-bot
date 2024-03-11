import manifestController from '../controllers/manifest.js';

const manifest = [
  {
    method: 'GET',
    path: '/run/manifest',
    handler: manifestController.get,
  },
];

export default manifest;
