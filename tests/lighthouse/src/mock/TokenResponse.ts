/*
 * @Author: doyle.wu
 * @Date: 2019-01-02 16:55:13
 */
import * as qs from "qs";
import { Response, MockResult } from "../mock/Response";
class TokenResponse extends Response {
  public body2: Map<string, any>;

  handle(url: URL, method: string, request): MockResult {
    if (!this.uri.test(url.pathname) || this.method !== method) {
      return { isMock: false };
    }

    let data = request.postData();
    let redirectUri = qs.parse(data)["redirect_uri"];
    let body;
    if (redirectUri !== "glip://rclogin") {
      body = this.body;
    } else {
      body = this.body2;
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
      body: JSON.stringify(body)
    };
  }
}

export { TokenResponse };
