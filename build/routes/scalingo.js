import scalingoController from '../../build/controllers/scalingo.js';

const scalingo = [
  {
    method: 'POST',
    path: '/build/scalingo/deploy-endpoint',
    handler: scalingoController.deployEndpoint,
  },
];

export default scalingo;
