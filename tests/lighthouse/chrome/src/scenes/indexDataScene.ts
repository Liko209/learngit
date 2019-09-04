/*
 * @Author: doyle.wu
 * @Date: 2019-04-19 17:01:32
 */

import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { IndexDataGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class IndexDataScene extends IndependenceScene {

  tags(): Array<string> {
    return ["IndexDataScene", "Login", "Trace", "API"];
  }

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

  async saveMetircsIntoDisk() {
    if (this.artifacts && !this.fpsMode) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
      await FileService.saveMemoryIntoDisk(this.artifacts, this.name());
    }
  }

  supportDashboard(): boolean {
    return true;
  }
}

export { IndexDataScene };
