/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 16:10:33
 */
import { RequestHook } from 'testcafe';

class MockClientHook extends RequestHook {
  public requestId: string;

  constructor(requestId: string) {
    super()
    this.requestId = requestId;
  }

  async onRequest(event) {
    if (this.requestId) {
      event.requestOptions.headers['x-mock-request-id'] = this.requestId;
    }
  }

  async onResponse(event) {
  }
}

export {
  MockClientHook
}
