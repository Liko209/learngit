/*
 * @Author: doyle.wu
 * @Date: 2019-02-27 10:18:13
 */
import { Scenario } from './scenario';
import { gatherers, LightHouseConfig } from '../lighthouse';
import { JupiterUtils } from '../utils';

class LoginScenario extends Scenario {
  private _finallyUrl: string;

  protected async login() {
  }

  protected async preHandle() {
    this.lightHouseConfig = new LightHouseConfig();

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.HomePageGatherer()
    });

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.LighthouseHacker()
    });

    this._finallyUrl = await JupiterUtils.getAuthUrl(this.url, this.browser);
  }

  protected finallyUrl(): string {
    return this._finallyUrl;
  }
}

export {
  LoginScenario
}
