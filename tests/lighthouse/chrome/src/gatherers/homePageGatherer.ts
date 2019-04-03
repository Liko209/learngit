/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require('lighthouse/lighthouse-core/gather/gatherers/gatherer');
import { HomePage } from '../pages';

class HomePageGatherer extends Gatherer {

  beforePass(passContext) {
  }

  async afterPass(passContext) {
    return {};
  }

  async pass(passContext) {
    let homePage = new HomePage(passContext);
    await homePage.waitForCompleted();
  }
}

export {
  HomePageGatherer
}
