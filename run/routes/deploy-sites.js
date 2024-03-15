import deploySitesController from '../controllers/deploy-sites';

const deploySites = [
  {
    method: 'POST',
    path: '/deploy-sites',
    handler: deploySitesController.deploySites,
  },
];

export { deploySites };
