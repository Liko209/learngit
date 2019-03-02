/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./Scene";
import { TaskDto, SceneDto } from "../models";
import { sceneConfigFactory } from "./config/SceneConfigFactory";
import { LoginGatherer } from "../gatherers/LoginGatherer";
import { SwitchConversationGatherer } from "../gatherers/SwitchConversationGatherer";
import { metriceService } from "../services/MetricService";

class SwitchConversationScene extends Scene {
  private convrsationIds: Array<string>;

  constructor(url: string, taskDto: TaskDto, convrsationIds: Array<string>) {
    super(url, taskDto);
    this.convrsationIds = convrsationIds;
  }

  async preHandle() {
    this.config = sceneConfigFactory.getSimplifyConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new SwitchConversationGatherer(this.convrsationIds)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await metriceService.createLoadingTime(
      sceneDto,
      this,
      SwitchConversationGatherer.name
    );
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
  }
}

export { SwitchConversationScene };
