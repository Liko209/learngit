/*
 * @Author: doyle.wu
 * @Date: 2019-01-02 09:37:44
 */
class ResponseCopyValue {
  public type: string; // 'value' | 'jsonPath'
  public refId: string;
  public expr: string;
}

class ResponseCopyItem {
  public key: string;
  public value: ResponseCopyValue;
}

class MockResult {
  public isMock: boolean;
  public status?: number;
  public headers?: Map<string, any>;
  public body?: any;
}
/**
 *  id: -1, url: ${JUPITER_GLIP2_URL}/restapi/oauth/token
 *  id: -2, url: ${JUPITER_GLIP2_URL}/restapi/v1.0/interop/generate-code
 *  id: -3, url: ${JUPITER_GLIP_URL}/api/login
 **/
class Response {
  public id: number;
  public uri: RegExp;
  public status: number;
  public method: string;
  public headers: Map<string, any>;
  public body: Map<string, any>;
  public copyHeaders: Map<string, ResponseCopyItem>;
  public copyBody: Map<string, ResponseCopyItem>;

  handle(url: URL, method: string, request): MockResult {
    /**
     *  For most scenarios, and pay attention to the same uri. Example:
     *  ${JUPITER_LOGIN_URL}/api/login
     *  ${JUPITER_GLIP_URL}/api/login
     **/
    if (!this.uri.test(url.pathname) || this.method !== method) {
      return { isMock: false };
    }

    let headers = Object.assign(
      {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": [
          "DNT",
          "Accept-Encoding",
          "Content-Type",
          "x-mobile-platform",
          "x-mobile-version",
          "Authorization"
        ].join(", "),
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
        "Access-Control-Expose-Headers": [
          "X-Authorization",
          "x-authorization",
          "X-CSRF-Token",
          "X-RC-Access-Token-Data"
        ].join(", "),
        "Access-Control-Allow-Origin": process.env.JUPITER_HOST
      },
      this.headers
    );

    return {
      isMock: true,
      headers: headers,
      status: this.status,
      body: JSON.stringify(this.body)
    };
  }
}

export { ResponseCopyValue, ResponseCopyItem, MockResult, Response };
