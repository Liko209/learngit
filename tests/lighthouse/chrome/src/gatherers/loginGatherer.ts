/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { JupiterUtils } from "../utils";
import { HomePage } from "../pages";

class LoginGatherer extends BaseGatherer {
  async _beforePass(passContext) {
    let { url } = passContext.settings;

    let homePage = new HomePage(passContext);

    let browser = await homePage.browser();

    let authUrl = await JupiterUtils.getAuthUrl(url, browser);
    let page = await homePage.newPage();

    await page.goto(authUrl);

    await homePage.waitForCompleted();

    await homePage.close();
  }

  async _afterPass(passContext) {
    return {};
  }

  async _pass(passContext) { }
}

export { LoginGatherer };
