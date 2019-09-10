/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:02:26
 */
import { LighthouseScene } from './lighthouseScene';
import { SceneConfig } from './config/sceneConfig';
import { LoginGatherer, HomePageGatherer } from '../gatherers';

class RefreshScene extends LighthouseScene {

  tags(): Array<string> {
    return ["RefreshScene", "Lighthouse"];
  }

  async preHandle() {
    this.config = new SceneConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    })
    this.config.passes[0].gatherers.push({
      instance: new HomePageGatherer()
    });
  }
}

export {
  RefreshScene
}
