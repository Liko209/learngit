/*
 * @Author: doyle.wu
 * @Date: 2019-02-27 10:18:13
 */
import { Scenario } from './scenario';
import { ScenarioConfigFactory, gatherers } from '../lighthouse';

class OfflineScenario extends Scenario {
  async preHandle() {
    this.lightHouseConfig = ScenarioConfigFactory.getOfflineConfig();

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.HomePageGatherer()
    });

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.OfflineGatherer()
    });

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.LighthouseHacker(false)
    });
  }
}

export {
  OfflineScenario
}
