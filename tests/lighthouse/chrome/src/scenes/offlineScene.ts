/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:03:33
 */
import { LighthouseScene } from './lighthouseScene';
import { SceneConfigFactory } from './config/sceneConfigFactory';
import { HomePageGatherer, OfflineGatherer, LoginGatherer } from '../gatherers';

class OfflineScene extends LighthouseScene {

  tags(): Array<string> {
    return ["OfflineScene", "Lighthouse"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getOfflineConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });

    this.config.passes[0].gatherers.push({
      instance: new HomePageGatherer()
    });

    this.config.passes[0].gatherers.push({
      instance: new OfflineGatherer()
    });
  }
}

export {
  OfflineScene
}
