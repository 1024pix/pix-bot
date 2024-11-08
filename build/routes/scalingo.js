import scalingoController from '../../build/controllers/scalingo.js';

const scalingo = [
  {
    method: 'POST',
    path: '/build/scalingo/deploy-endpoint',
    handler: scalingoController.deployEndpoint,
  },
  {
    method: 'POST',
    path: '/build/scalingo/review-app-deploy-endpoint',
    handler: scalingoController.reviewAppDeployEndpoint,
  },
];

export default scalingo;
