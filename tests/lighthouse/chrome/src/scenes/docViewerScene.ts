/*
 * @Author: doyle.wu
 * @Date: 2019-08-29 13:27:16
 */
import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { DocViewerGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class DocViewerScene extends IndependenceScene {
  tags(): Array<string> {
    return ["DocViewerScene", "Viewer", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getProfileConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new DocViewerGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, DocViewerGatherer.name);
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
  DocViewerScene
}
