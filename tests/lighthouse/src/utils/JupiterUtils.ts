/*
 * @Author: doyle.wu
 * @Date: 2018-12-19 15:48:36
 */
import axios from "axios";
import { logUtils } from "./LogUtils";

/**
 *  Login flow: https://wiki.ringcentral.com/display/~doyle.wu/Login+flow+of+Jupiter
 **/
class JupiterUtils {
  private clientId: string = process.env.JUPITER_APP_KEY;
  private clientSecret: string = process.env.JUPITER_APP_SECRET;
  private logger = logUtils.getLogger(__filename);

  private async login(redirectUrl: string, browser) {
    let start = Date.now();
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

    let headers = {};
    if (browser && browser.mockClient && browser.mockClient.requestId) {
      headers["x-mock-request-id"] = browser.mockClient.requestId;
    }

    const response = await axios.post(
      `${process.env.JUPITER_LOGIN_URL}/api/login`,
      body,
      { headers }
    );
    
    this.logger.info(`JupiterUtils.login cost ${Date.now() - start}ms`);
    return response.data;
  }

  async getAuthUrl(redirectUrl: string, browser): Promise<string> {
    let data = await this.login(redirectUrl, browser);

    return data.redirectUri;
  }
}

const jupiterUtils = new JupiterUtils();

export { jupiterUtils };
