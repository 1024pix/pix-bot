import applicationController from '../controllers/applications';

const applications = [
  {
    method: 'POST',
    path: '/applications/{name}/cdn-cache-invalidations',
    handler: applicationController.invalidateCdnCache,
  },
];

export { applications };
