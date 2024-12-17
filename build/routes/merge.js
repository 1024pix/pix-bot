import mergeController from '../controllers/merge.js';

const merge = [
  {
    method: 'POST',
    path: '/merge',
    handler: mergeController.handle,
  },
];

export default merge;
