/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./scene";
import { Config } from "../config";
import { SceneDto } from "../models";
import { SceneConfigFactory } from "./config/sceneConfigFactory";
import { SwitchConversationGatherer } from "../gatherers";
import { MetricService, FileService } from "../services";

class SwitchConversationScene extends Scene {
  private convrsationIds: Array<string> = Config.switchConversationIds;

  tags(): Array<string> {
    return ["SwitchConversationScene", "Message", "MessagePanel", "Conversation", "RightRail", "File", "Image", "Memory", "Trace", "API"];
  }

  async preHandle() {
    this.config = SceneConfigFactory.getCommonLoginConfig({ fpsMode: this.fpsMode });

    this.config.passes[0].gatherers.unshift({
      instance: new SwitchConversationGatherer(this.convrsationIds)
    });
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await MetricService.createLoadingTime(
      sceneDto,
      this,
      SwitchConversationGatherer.name
    );
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

  supportDashboard(): boolean {
    return true;
  }
}

export { SwitchConversationScene };
