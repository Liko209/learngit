/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./scene";
import { Config } from "../config";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { LoginGatherer, SearchGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class SearchScene extends Scene {
  private keywords: Array<string> = Config.searchKeywords;

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new SearchGatherer(this.keywords)
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
  }

  supportFps(): boolean {
    return true;
  }
}

export { SearchScene };
