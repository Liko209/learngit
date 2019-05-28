/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 16:55:24
 */
import { Config, Globals } from '.';
import { MockClient } from 'mock-client';
import { Browser, Electron, Firefox } from './browsers';
import { MetricHelper } from './helpers';
import { VersionInfo } from './models';
import { SceneDto } from './dtos';

enum Props {
  MOCK_CLIENT,
  BROWSER,
  METRIC_HELPER,
  VERSION,
  SCENE_NAME,
  SCENE
}

class Helper {
  private t: TestController;

  constructor(t: TestController) {
    this.t = t;
  }

  private _get<T>(key: Props, generator?: () => T): T {
    if (!this.t.ctx[key] && generator) {
      this.t.ctx[key] = generator();
    }
    return this.t.ctx[key];
  }

  getMockClick(): MockClient {
    return this._get(Props.MOCK_CLIENT, () => new MockClient(Config.mockServerUrl));
  }

  getBrowser(): Browser {
    return this._get(Props.BROWSER, () => {
      const browser = !!Globals.browser ? Globals.browser.toLowerCase() : "";
      let res: Browser;
      if (browser.indexOf("electron") > -1) {
        res = new Electron(this.t);
      } else if (browser.indexOf("firefox") > -1) {
        res = new Firefox(this.t);
      } else {
        res = new Browser(this.t);
      }
      Globals.browserName = res.name;
      return res;
    });
  }

  getMetricHelper(): MetricHelper {
    return this._get(Props.METRIC_HELPER, () => new MetricHelper(this.t));
  }

  getVersion(host: string): VersionInfo {
    return Globals.versions[host];
  }

  setVersion(host: string, info: VersionInfo) {
    Globals.versions[host] = info;
  }

  getSceneName(): string {
    return this._get(Props.SCENE_NAME);
  }

  setSceneName(name: string) {
    return this._get(Props.SCENE_NAME, () => name);
  }

  getScene(): SceneDto {
    return this._get(Props.SCENE);
  }

  setScene(scene: SceneDto) {
    return this._get(Props.SCENE, () => scene);
  }
}

const h = (t: TestController): Helper => {
  if (!t.ctx['__helper']) {
    t.ctx['__helper'] = new Helper(t);
  }
  return t.ctx['__helper'];
}

export {
  h
}
