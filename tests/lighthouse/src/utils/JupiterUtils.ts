/*
 * @Author: doyle.wu
 * @Date: 2018-12-19 15:48:36
 */
import axios from "axios";
import * as qs from "qs";
import * as btoa from "btoa";
import { logUtils } from "./LogUtils";
/**
 *  Login flow: https://wiki.ringcentral.com/display/~doyle.wu/Login+flow+of+Jupiter
 *  Example:
 *      let response;
 *      let url = "https://develop.fiji.gliprc.com";
 *
 *      let code = await jupiterUtils.getAuthCode(url);
 *      response = await jupiterUtils.getRcToken(code, url);
 *
 *      response = await jupiterUtils.getRcCode(response.data["access_token"]);
 *
 *      response = await jupiterUtils.getRcToken(response.data["code"]);
 *
 *      response = await jupiterUtils.getGlipToken(response.data);
 **/
class JupiterUtils {
  private clientId: string = process.env.JUPITER_APP_KEY;
  private clientSecret: string = process.env.JUPITER_APP_SECRET;
  private logger = logUtils.getLogger(__filename);

  private async login(redirectUrl: string) {
    let url = new URL(redirectUrl);
    const redirectUri = url.origin;
    const body = {
      state: `/?env=${process.env.JUPITER_ENV}`,
      username: process.env.JUPITER_USER_CREDENTIAL,
      password: process.env.JUPITER_USER_PASSWORD,
      autoLogin: false,
      ibb: "",
      sddi: "",
      prompt: "login sso",
      display: "touch",
      clientId: this.clientId,
      appUrlScheme: redirectUri,
      responseType: "code",
      responseHint: "",
      glipAuth: true,
      localeId: "en_US",
      extension: process.env.JUPITER_USER_PIN
    };

    const response = await axios.post(
      `${process.env.JUPITER_LOGIN_URL}/api/login`,
      body
    );
    return response.data;
  }

  async getAuthUrl(redirectUrl: string): Promise<string> {
    let data = await this.login(redirectUrl);
    return data.redirectUri;
  }

  async getAuthCode(redirectUrl: string): Promise<string> {
    let data = await this.login(redirectUrl);
    return data.authorizationCode;
  }

  async getRcToken(code: string, redirectUrl: string = "glip://rclogin") {
    let authorization = btoa(`${this.clientId}:${this.clientSecret}`);
    const headers = {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded"
    };

    const body = qs.stringify({
      code: code,
      redirect_uri: redirectUrl,
      grant_type: "authorization_code"
    });

    this.logger.info(`getRcToken body : ${body}`);
    const response = await axios.post(
      `${process.env.JUPITER_GLIP2_URL}/restapi/oauth/token`,
      body,
      { headers }
    );
    return response;
  }

  async getRcCode(token: string) {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8"
    };

    const body = {
      clientId: this.clientId,
      redirectUri: "glip://rclogin"
    };

    this.logger.info(`getRcCode headers : ${headers}`);

    const response = await axios.post(
      `${process.env.JUPITER_GLIP2_URL}/restapi/v1.0/interop/generate-code`,
      body,
      { headers }
    );
    return response;
  }

  async getGlipToken(tk) {
    const headers = {
      "Content-Type": "application/json;charset=utf-8"
    };

    const body = {
      rc_access_token_data: btoa(JSON.stringify(tk))
    };

    this.logger.info(`getRcCode getGlipToken : ${JSON.stringify(body)}`);

    const response = await axios.put(
      `${process.env.JUPITER_GLIP_URL}/api/login`,
      body,
      { headers }
    );
    return response;
  }
}

const jupiterUtils = new JupiterUtils();

export { jupiterUtils };
