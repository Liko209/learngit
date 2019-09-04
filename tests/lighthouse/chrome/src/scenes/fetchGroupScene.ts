/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { FetchGroupGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class FetchGroupScene extends IndependenceScene {

  tags(): Array<string> {
    return ["FetchGroupScene", "Message", "LeftRail", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new FetchGroupGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(
      sceneDto,
      this,
      FetchGroupGatherer.name
    );
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts && !this.fpsMode) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
      await FileService.saveMemoryIntoDisk(this.artifacts, this.name());
    }
    this.artifacts['MemoryGatherer'] = {};
  }

  supportFps(): boolean {
    return true;
  }

  supportDashboard(): boolean {
    return true;
  }
}

export { FetchGroupScene };
