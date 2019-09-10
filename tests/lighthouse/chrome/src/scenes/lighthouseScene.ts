/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:55
 */
import { Scene } from "./scene";
import * as lighthouse from "lighthouse";
import { PptrUtils } from "../utils";
import * as reportGenerater from "lighthouse/lighthouse-core/report/report-generator";

class LighthouseScene extends Scene {
  /**
   * @description: run scene. don't override this method
   */
  async run(): Promise<boolean> {
    this.logger.info(`start run scene --> ${this.constructor.name}`);
    for (let i = 0; i < this.RETRY_COUNT; i++) {
      try {
        const startTime = new Date();

        await this.clearGlobals();

        await this.launchBrowser();

        await this.preHandle();

        await this.clearCustomGathererWraning();

        await this.collectData();

        const endTime = new Date();
        this.timing = {
          startTime,
          endTime,
          total: endTime.getTime() - startTime.getTime()
        };


        if (this.isSuccess()) {
          await this.saveMetircsIntoDisk();

          let sceneDto = await this.saveMetircsIntoDb();

          await this.afterSaveMetrics(sceneDto);

          return true;
        }
      } catch (err) {
        this.logger.error(err);
      }
    }

    // save last failure report, and not save result into db.
    await this.saveMetircsIntoDisk();
    return false;
  }

  async clearCustomGathererWraning() {
    this.config.settings.url = this.url;

    let passes = this.config.passes;
    let customGatherers = new Array<string>();

    for (let pass of passes) {
      let gatherers = pass.gatherers;
      for (let g of gatherers) {
        if (g.instance) {
          customGatherers.push(g.instance.constructor.name);
        }
      }
    }

    let requiredArtifacts = Array.from(new Set(customGatherers));
    this.config.audits.push({
      implementation: class NoWarningAudit {
        static get meta() {
          return {
            id: "no-warning-audit",
            title: "No warning audit",
            failureTitle: "no failure",
            description: "no warning audit",
            requiredArtifacts: requiredArtifacts
          };
        }

        static audit(artifacts) {
          return { rawValue: true, score: 1 };
        }
      }
    });
  }

  /**
   * @description: collect performance metrics
   */
  async collectData() {
    try {
      const { lhr, artifacts } = await lighthouse(
        this.finallyUrl(),
        {
          port: new URL(this.browser.wsEndpoint()).port,
          logLevel: "info",
          maxWaitForLoad: 120 * 1000
        },
        this.config.toLightHouseConfig()
      );

      lhr["finalUrl"] = this.url;
      lhr["uri"] = new URL(this.url).pathname;
      lhr["aliasUri"] = lhr["uri"];
      lhr["requestedUrl"] = this.url;

      this.data = lhr;
      this.report = reportGenerater.generateReport(lhr, "html");
      this.artifacts = artifacts;
    } catch (err) {
      throw err;
    } finally {
      await PptrUtils.close(this.browser);
      this.browser = undefined;
    }
  }

  isSuccess(): boolean {
    if (this.data) {
      let { categories } = this.data;
      if (categories) {
        let scores = {
          performance: -1,
          pwa: -1,
          accessibility: -1,
          "best-practices": -1,
          seo: -1
        };
        let cnt = 0;
        let keys = Object.keys(scores);
        for (let key of keys) {
          if (
            categories[key] &&
            (categories[key].score || categories[key].score >= 0)
          ) {
            cnt++;
            scores[key] = categories[key].score * 100;
          }
        }

        this.logger.info(`isSuccess : ${JSON.stringify(scores)}`);

        return cnt === keys.length;
      }
    }
    return false;
  }
}

export { LighthouseScene };
