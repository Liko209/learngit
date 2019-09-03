/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { IndependenceScene } from ".";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { SearchGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class SearchScene extends IndependenceScene {

  tags(): Array<string> {
    return ["SearchScene", "Search", "Post", "People", "Group", "Team", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getProfileConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new SearchGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, SearchGatherer.name);
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

export { SearchScene };
