/*
 * @Author: doyle.wu
 * @Date: 2019-08-26 15:59:28
 */
import { Scene } from "./scene";
import { BaseGatherer } from "../gatherers"
import * as Driver from "lighthouse/lighthouse-core/gather/driver";
import * as Connection from "lighthouse/lighthouse-core/gather/connections/cri";
import { PptrUtils } from "../utils";

class IndependenceScene extends Scene {

  async run(): Promise<boolean> {
    this.logger.info(`start run scene --> ${this.constructor.name}`);
    for (let i = 0; i < this.RETRY_COUNT; i++) {
      try {
        const startTime = new Date();

        await this.clearGlobals();

        await this.preHandle();

        await this.launchBrowser();

        await this.execGatherers();

        await this.fillData();

        const endTime = new Date();
        this.timing = {
          startTime,
          endTime,
          total: endTime.getTime() - startTime.getTime()
        };

        await this.saveMetircsIntoDisk();

        let sceneDto = await this.saveMetircsIntoDb();

        await this.afterSaveMetrics(sceneDto);

        return true;
      } catch (err) {
        this.logger.error(err);
      } finally {
        await PptrUtils.close(this.browser);
      }
    }
    return true;
  }

  async execGatherers() {
    const endPoint = new URL(this.browser.wsEndpoint());
    const connection = new Connection(endPoint.port, endPoint.hostname);
    await connection.connect();
    const driver = new Driver(connection);
    const passContext = {
      driver,
      settings: {
        url: this.url
      }
    }
    const gatherers = this.getGatherers();

    let page = await this.browser.newPage();

    for (let gatherer of gatherers) {
      this.logger.info(`${gatherer.constructor.name}.beforePass`);
      await gatherer.beforePass(passContext);
    }

    await page.goto(this.url);

    for (let gatherer of gatherers) {
      this.logger.info(`${gatherer.constructor.name}.pass`);
      await gatherer.pass(passContext);
    }
    if (!this.artifacts) {
      this.artifacts = {};
    }
    for (let gatherer of gatherers) {
      this.logger.info(`${gatherer.constructor.name}.afterPass`);
      this.artifacts[gatherer.constructor.name] = await gatherer.afterPass(passContext);
    }

    await connection.disconnect();

    return true;
  }

  async fillData() {
    this.data = {
      uri: this.url, aliasUri: this.url, categories: {}, audits: {}
    }
  }

  getGatherers(): Array<BaseGatherer> {
    const gatherers: Array<BaseGatherer> = [];

    for (let pass of this.config.passes) {
      for (let item of pass.gatherers) {
        if (item.instance) {
          gatherers.push(item.instance);
        }
      }
    }

    return gatherers;
  }
}

export {
  IndependenceScene
}

