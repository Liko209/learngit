/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { HomePage } from '../pages';

class HomePageGatherer extends BaseGatherer {

  async _beforePass(passContext) {
  }

  async _afterPass(passContext) {
    return {};
  }

  async _pass(passContext) {
    let homePage = new HomePage(passContext);
    await homePage.waitForCompleted();
  }
}

export {
  HomePageGatherer
}
