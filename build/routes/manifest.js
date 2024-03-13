import * as manifestController from '../controllers/manifest';

const manifest = [
  {
    method: 'GET',
    path: '/build/manifest',
    handler: manifestController.get,
  },
];

export { manifest };
