/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:55
 */
import { SceneConfig } from "./config/SceneConfig";
import * as lighthouse from "lighthouse";
import { logUtils } from "../utils/LogUtils";
import { puppeteerUtils } from "../utils/PuppeteerUtils";
import { TaskDto, SceneDto } from "../models";
import { fileService } from "../services/FileService";
import { metriceService } from "../services/MetricService";
import { mockHelper } from "../mock";
import * as reportGenerater from "lighthouse/lighthouse-core/report/report-generator";

const EXTENSION_PATH = `${process.cwd()}/extension`;
type Timing = { startTime: Date; endTime: Date; total: number };

const RETRY_COUNT = 3;

class Scene {
  protected url: string;
  protected config: SceneConfig;
  protected timing: Timing;
  protected data;
  protected report;
  protected artifacts;
  protected taskDto: TaskDto;
  protected logger = logUtils.getLogger(__filename);

  constructor(url: string, taskDto: TaskDto) {
    this.url = url;
    this.taskDto = taskDto;
  }

  /**
   * @description: run scene. don't override this method
   */
  async run(): Promise<boolean> {
    this.logger.info(`start run scene --> ${this.constructor.name}`);
    for (let i = 0; i < RETRY_COUNT; i++) {
      try {
        const startTime = new Date();

        await this.preHandle();

        await this.clearCustomGathererWraning();

        await this.collectData();

        const endTime = new Date();
        this.timing = {
          startTime,
          endTime,
          total: endTime.getTime() - startTime.getTime()
        };
      } catch (err) {
        this.logger.error(err);
      }

      if (this.isSuccess()) {
        await this.saveMetircsIntoDisk();

        await this.saveMetircsIntoDb();
        return true;
      }
    }

    // save last failure report, and not save result into db.
    await this.saveMetircsIntoDisk();
    return false;
  }

  /**
   * @description: save performance metrics into disk. don't override this method
   */
  async saveMetircsIntoDisk() {
    let fileName = this.name();
    if (this.report) {
      await fileService.saveReportIntoDisk(this.report, fileName);
    }
    if (this.artifacts) {
      await fileService.saveArtifactsIntoDisk(this.artifacts, fileName);
    }
    if (this.data) {
      await fileService.saveDataIntoDisk(this.data, fileName);
    }
  }

  /**
   * @description: scene pre handle
   */
  async preHandle() {
    this.config = new SceneConfig();

    mockHelper.open();
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
          return { rawValue: true };
        }
      }
    });
  }

  /**
   * @description: collect performance metrics
   */
  async collectData() {
    const browser = await puppeteerUtils.launch({
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--enable-experimental-extension-apis"
      ]
    });

    try {
      const { lhr, artifacts } = await lighthouse(
        this.finallyUrl(),
        {
          port: new URL(browser.wsEndpoint()).port,
          logLevel: "info"
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
      this.logger.error(err);
    } finally {
      await browser.close();
    }
  }

  /**
   * @description: save performance metrics into db
   */
  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await metriceService.createScene(this.taskDto, this);

    await metriceService.createPerformance(sceneDto, this);

    await metriceService.createPerformanceItem(sceneDto, this);

    return sceneDto;
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

  /**
   * @description: get scene name
   */
  name(): string {
    if (this.config.name === "") {
      return `${this.constructor.name}`;
    } else {
      return `${this.constructor.name} ${this.config.name}`;
    }
  }

  finallyUrl(): string {
    return this.url;
  }

  getData() {
    return this.data;
  }

  getArtifacts() {
    return this.artifacts;
  }

  getTiming(): Timing {
    return this.timing;
  }
}

export { Scene };
