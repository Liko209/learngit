/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 08:37:56
 */
import { Scene } from "./Scene";
import { SceneDto } from "../models";
import { sceneConfigFactory } from "./config/SceneConfigFactory";
import { LoginGatherer } from "../gatherers/LoginGatherer";
import { FetchGroupGatherer } from "../gatherers/FetchGroupGatherer";
import { mockHelper } from "../mock";
import { metriceService } from "../services/MetricService";

class FetchGroupScene extends Scene {
  async preHandle() {
    this.config = sceneConfigFactory.getSimplifyConfig();

    this.config.passes[0].gatherers.unshift({
      instance: new LoginGatherer()
    });
    this.config.passes[0].gatherers.unshift({
      instance: new FetchGroupGatherer()
    });

    mockHelper.open();
  }

  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await super.saveMetircsIntoDb();
    await metriceService.createLoadingTime(
      sceneDto,
      this,
      FetchGroupGatherer.name
    );
    return sceneDto;
  }
}

export { FetchGroupScene };
