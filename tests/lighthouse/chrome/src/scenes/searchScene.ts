/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./scene";
import { TaskDto, SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { LoginGatherer, SearchGatherer } from "../gatherers";
import { MetriceService, FileService } from "../services";

class SearchScene extends Scene {
  private keywords: Array<string>;

  constructor(url: string, taskDto: TaskDto, keywords: Array<string>) {
    super(url, taskDto);
    this.keywords = keywords;
  }

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new SearchGatherer(this.keywords)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetriceService.createLoadingTime(sceneDto, this, SearchGatherer.name);
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
    }
  }
}

export { SearchScene };
