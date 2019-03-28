/*
 * @Author: doyle.wu
 * @Date: 2019-02-26 10:10:55
 */
const Gatherer = require('lighthouse/lighthouse-core/gather/gatherers/gatherer');
import { HomePage } from '../../pages';

class HomePageGatherer extends Gatherer {

  beforePass(passContext) {
  }

  async afterPass(passContext) {
    return {};
  }

  async pass(passContext) {
    let homePage = new HomePage({ passContext });
    await homePage.waitForCompleted();
  }
}

export {
  HomePageGatherer
}
