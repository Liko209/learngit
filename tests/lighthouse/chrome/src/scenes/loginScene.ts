/*
 * @Author: doyle.wu
 * @Date: 2018-12-09 21:01:04
 */
import { Scene } from './scene';
import { SceneConfig } from './config/sceneConfig';
import { JupiterUtils } from '../utils';
import { HomePageGatherer } from '../gatherers';

class LoginScene extends Scene {
  private _finallyUrl: string;

  async preHandle() {
    this.config = new SceneConfig();

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
