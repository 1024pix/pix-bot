import securityController from '../controllers/security.js';

const securities = [
  {
    method: 'POST',
    path: '/security/block-access-on-baleen-from-datadog',
    handler: securityController.blockAccessOnBaleen,
  },
];

export default securities;
