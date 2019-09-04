/*
 * @Author: doyle.wu
 * @Date: 2018-12-09 21:01:04
 */
import { LighthouseScene } from './lighthouseScene';
import { SceneConfigFactory } from './config/sceneConfigFactory';
import { JupiterUtils } from '../utils';
import { HomePageGatherer } from '../gatherers';

class LoginScene extends LighthouseScene {
  private _finallyUrl: string;

  tags(): Array<string> {
    return ["LoginScene", "Lighthouse"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getConfig();

    this.config.passes[0].gatherers.push({
      instance: new HomePageGatherer()
    });

    this._finallyUrl = await JupiterUtils.getAuthUrl(this.url, this.browser);
  }

  finallyUrl(): string {
    return this._finallyUrl;
  }
}

export {
  LoginScene
}
