/*
 * @Author: doyle.wu
 * @Date: 2019-08-29 13:27:16
 */
import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { ImageViewerGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class ImageViewerScene extends IndependenceScene {
  tags(): Array<string> {
    return ["ImageViewerScene", "Viewer", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getProfileConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new ImageViewerGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, ImageViewerGatherer.name);
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

  getProfileUrl(): string {
    return "http://xia01-i01-kmo01.lab.rcch.ringcentral.com:9000/kamino/performance.zip";
  }
}

export {
  ImageViewerScene
}
