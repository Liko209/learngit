/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./scene";
import { TaskDto, SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { LoginGatherer, SwitchConversationGatherer } from "../gatherers";
import { MetriceService, FileService } from "../services";

class SwitchConversationScene extends Scene {
  private convrsationIds: Array<string>;

  constructor(url: string, taskDto: TaskDto, convrsationIds: Array<string>) {
    super(url, taskDto);
    this.convrsationIds = convrsationIds;
  }

  async preHandle() {
    this.config = SceneConfigFactory.getSimplifyConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new SwitchConversationGatherer(this.convrsationIds)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetriceService.createLoadingTime(
      sceneDto,
      this,
      SwitchConversationGatherer.name
    );
    return sceneDto;
  }

  async saveMetircsIntoDisk() {
    if (this.artifacts) {
      await FileService.saveTracesIntoDisk(this.artifacts, this.name());
      await FileService.saveMemoryIntoDisk(this.artifacts, this.name());
    }
  }
}

export { SwitchConversationScene };
