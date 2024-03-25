import manifestController from '../controllers/manifest.js';

const manifest = [
  {
    method: 'GET',
    path: '/build/manifest',
    handler: manifestController.get,
  },
];

export { manifest };
