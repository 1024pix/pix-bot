import axios from 'axios';

import * as logger from './services/logger.js';

class HttpResponse {
  constructor({ code, data, isSuccessful }) {
    this.code = code;
    this.data = data;
    this.isSuccessful = isSuccessful;
  }
}

const httpAgent = {
  async post({ url, payload, headers }) {
    try {
      const config = {
        headers,
      };
      const httpResponse = await axios.post(url, payload, config);

      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      let code;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = null;
        data = httpErr.message;
      }

      const message = `End POST request to ${url} error: ${code || ''} ${JSON.stringify(data)}`;
      logger.error({ event: 'http-client-request', message });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
};

export { httpAgent };
