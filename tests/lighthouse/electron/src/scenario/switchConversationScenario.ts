/*
 * @Author: doyle.wu
 * @Date: 2019-02-27 10:18:13
 */
import { Scenario } from './scenario';
import { TaskDto, SceneDto } from '../model';
import { ScenarioConfigFactory, gatherers } from '../lighthouse';
import { MetricService, FileService } from '../service';

class SwitchConversationScenario extends Scenario {
  private convrsationIds: Array<string>;

  constructor(taskDto: TaskDto, convrsationIds: Array<string>, url?: string) {
    super(taskDto, url);
    this.convrsationIds = convrsationIds;
  }

  async preHandle() {
    this.lightHouseConfig = ScenarioConfigFactory.getSimplifyConfig();

    this.lightHouseConfig.passes[0].gatherers.unshift({
      instance: new gatherers.SwitchConversationGatherer(this.convrsationIds)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(sceneDto, this, gatherers.SwitchConversationGatherer.name);
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.scenarioName());
    }
  }
}

export {
  SwitchConversationScenario
}
