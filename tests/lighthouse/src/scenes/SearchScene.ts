/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./Scene";
import { TaskDto, SceneDto } from "../models";
import { sceneConfigFactory } from "./config/SceneConfigFactory";
import { LoginGatherer } from "../gatherers/LoginGatherer";
import { SearchGatherer } from "../gatherers/SearchGatherer";
import { mockHelper } from "../mock";
import { metriceService } from "../services/MetricService";

class SearchScene extends Scene {
  private keywords: Array<string>;

  constructor(url: string, taskDto: TaskDto, keywords: Array<string>) {
    super(url, taskDto);
    this.keywords = keywords;
  }

  async preHandle() {
    this.config = sceneConfigFactory.getSimplifyConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new SearchGatherer(this.keywords)
    });

    mockHelper.open();
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await metriceService.createLoadingTime(sceneDto, this, SearchGatherer.name);
    return sceneDto;
  }
}

export { SearchScene };
