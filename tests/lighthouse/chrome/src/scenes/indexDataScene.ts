/*
 * @Author: doyle.wu
 * @Date: 2019-04-19 17:01:32
 */

import { Scene } from "./scene";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { IndexDataGatherer } from "../gatherers";
import { MetricService } from "../services";

class IndexDataScene extends Scene {

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig({ fpsMode: false });

    this.config.audits = [];
    this.config.passes[0].gatherers = [{
      instance: new IndexDataGatherer()
    }];
    this.config.categories["performance"]["auditRefs"] = [];
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, IndexDataGatherer.name);
    return sceneDto;
  }

  supportDashboard(): boolean {
    return true;
  }
}

export { IndexDataScene };
