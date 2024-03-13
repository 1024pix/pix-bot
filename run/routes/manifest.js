import * as manifestController from '../controllers/manifest';

const manifest = [
  {
    method: 'GET',
    path: '/run/manifest',
    handler: manifestController.get,
  },
];

export { manifest };
