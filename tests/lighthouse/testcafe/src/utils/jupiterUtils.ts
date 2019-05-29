/*
 * @Author: doyle.wu
 * @Date: 2018-12-19 15:48:36
 */
import axios from "axios";
import { LogUtils } from "./logUtils";
import { Config, h } from '..';

const logger = LogUtils.getLogger(__filename);
/**
 *  Login flow: https://wiki.ringcentral.com/display/~doyle.wu/Login+flow+of+Jupiter
 **/
class JupiterUtils {

  private static async login(redirectUrl: string, t: TestController) {
    let start = Date.now();
    let url = new URL(redirectUrl);
    const redirectUri = url.origin;
    const body = {
      state: `/?env=${Config.jupiterEnv}`,
      username: Config.jupiterUser,
      password: Config.jupiterPassword,
      autoLogin: false,
      ibb: "",
      sddi: "",
      prompt: "login sso",
      display: "touch",
      clientId: Config.jupiterAppKey,
      appUrlScheme: redirectUri,
      responseType: "code",
      responseHint: "",
      glipAuth: true,
      localeId: "en_US",
      extension: Config.jupiterPin
    };

    let headers = {};
    const mockClient = h(t).getMockClick();
    if (mockClient['requestId']) {
      headers["x-mock-request-id"] = mockClient['requestId'];
    }

    const response = await axios.post(
      `${Config.jupiterLoginUrl}/api/login`,
      body,
      { headers }
    );

    logger.info(`JupiterUtils.login cost ${Date.now() - start}ms`);
    return response.data;
  }

  static async getAuthUrl(redirectUrl: string, t: TestController): Promise<string> {
    let data = await JupiterUtils.login(redirectUrl, t);

    return data.redirectUri;
  }
}

export { JupiterUtils };
