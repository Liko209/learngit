/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { CallLogGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class CallLogScene extends IndependenceScene {

  tags(): Array<string> {
    return ["CallLogScene", "Phone", "Call", "Log", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new CallLogGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(
      sceneDto,
      this,
      CallLogGatherer.name
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

export { CallLogScene };
