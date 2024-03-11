import deploySitesController from '../controllers/deploy-sites.js';

const deploySites = [
  {
    method: 'POST',
    path: '/deploy-sites',
    handler: deploySitesController.deploySites,
  },
];

export default deploySites;
