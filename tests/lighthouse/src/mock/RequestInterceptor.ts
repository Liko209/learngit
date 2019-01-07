/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 10:25:35
 */

import { mockData } from "./MockData";
import { MockResult } from "./Response";
import { logUtils } from "../utils/LogUtils";

const logger = logUtils.getLogger(__filename);

const onRequest = request => {
  /*
    response <Object> Response that will fulfill this request
        status <number> Response status code, defaults to 200.
        headers <Object> Optional response headers
        contentType <string> If set, equals to setting Content-Type response header
        body <Buffer|string> Optional response body
    */
  let url = new URL(request.url());
  let method = request.method();

  if (request.method() === "OPTIONS") {
    request.continue();
    return;
  }

  let res: MockResult;
  for (let item of mockData.values()) {
    res = item.handle(url, method, request);
    if (!res.isMock) {
      continue;
    }

    logger.info(`modify response for uri[${method}]${url.pathname}`);

    request.respond({
      status: res.status,
      headers: res.headers,
      body: res.body
    });
    return;
  }

  request.continue();
};

export { onRequest };
