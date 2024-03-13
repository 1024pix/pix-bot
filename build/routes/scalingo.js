import scalingoController from '../../build/controllers/scalingo';

const scalingo = [
  {
    method: 'POST',
    path: '/build/scalingo/deploy-endpoint',
    handler: scalingoController.deployEndpoint,
  },
];

export { scalingo };
