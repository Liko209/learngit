/*
 * @Author: doyle.wu
 * @Date: 2019-02-27 10:18:13
 */
import { Scene } from './scene';
import { TaskDto, SceneDto } from '../model';
import { ScenarioConfigFactory, gatherers } from '../lighthouse';
import { MetricService, FileService } from '../service';

class SearchScene extends Scene {
  private keywords: Array<string>;

  constructor(taskDto: TaskDto, keywords: Array<string>, url?: string) {
    super(taskDto, url);
    this.keywords = keywords;
  }

  async preHandle() {
    this.lightHouseConfig = ScenarioConfigFactory.getSimplifyConfig();

    this.lightHouseConfig.passes[0].gatherers.unshift({
      instance: new gatherers.SearchGatherer(this.keywords)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, gatherers.SearchGatherer.name);
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
    }
  }
}

export {
  SearchScene
}
