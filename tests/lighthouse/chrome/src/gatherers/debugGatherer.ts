/*
 * @Author: doyle.wu
 * @Date: 2019-07-08 10:11:17
 */
import { Config } from '../config';
import { BaseGatherer } from './baseGatherer';
import { HomePage } from "../pages"
import * as bluebird from 'bluebird';

abstract class DebugGatherer extends BaseGatherer {

  protected async disableCache(passContext): Promise<void> {
    let homePage = new HomePage(passContext);
    let page = await homePage.page();
    let { url } = passContext.settings;

    const client = await page.target().createCDPSession();
    // get latest version of Jupiter
    await client.send('ServiceWorker.enable');
    await client.send('ServiceWorker.stopAllWorkers');
    await client.send('ServiceWorker.unregister', { scopeURL: url });
    await page.setCacheEnabled(false);

    await page.goto(url);

    await homePage.waitForCompleted();

    await page.reload({ timeout: 120000 });

    await homePage.waitForCompleted();

    await page.setCacheEnabled(true);
  }

  async afterPass(passContext) {
    try {
      const result = await this._afterPass(passContext)
      if (Config.debugMode) {
        this.logger.info("start debug...");
        await bluebird.delay(1 << 30);
      }
      return result;
    } catch (err) {
      this.logger.error((err as Error).stack);
      throw err;
    }
  }
}

export {
  DebugGatherer
}
