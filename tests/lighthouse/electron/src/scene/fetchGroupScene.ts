/*
 * @Author: doyle.wu
 * @Date: 2019-02-27 10:18:13
 */
import { Scene } from './scene';
import { SceneDto } from '../model';
import { ScenarioConfigFactory, gatherers } from '../lighthouse';
import { MetricService, FileService } from '../service';

class FetchGroupScene extends Scene {

  async preHandle() {
    this.lightHouseConfig = ScenarioConfigFactory.getSimplifyConfig();

    this.lightHouseConfig.passes[0].gatherers.unshift({
      instance: new gatherers.FetchGroupGatherer()
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, gatherers.FetchGroupGatherer.name);
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
      await FileService.saveMemoryIntoDisk(this.artifacts, this.name());
    }
  }
}

export {
  FetchGroupScene
}
