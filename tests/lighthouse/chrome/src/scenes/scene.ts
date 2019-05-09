/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:55
 */
import { SceneConfig } from "./config/sceneConfig";
import * as lighthouse from "lighthouse";
import { LogUtils } from "../utils/logUtils";
import { PptrUtils } from "../utils/pptrUtils";
import { TaskDto, SceneDto } from "../models";
import { FileService, MetricService, DashboardService } from "../services";
import * as reportGenerater from "lighthouse/lighthouse-core/report/report-generator";
import { Config } from "../config";
import { globals } from "../globals";

const EXTENSION_PATH = `${process.cwd()}/extension`;
type Timing = { startTime: Date; endTime: Date; total: number };

const RETRY_COUNT = 3;

class Scene {
  protected browser;
  protected url: string;
  protected config: SceneConfig;
  protected timing: Timing;
  protected data;
  protected report;
  protected artifacts;
  protected taskDto: TaskDto;
  protected fpsMode: boolean = false;
  protected logger = LogUtils.getLogger(__filename);

  constructor(taskDto: TaskDto) {
    this.url = Config.jupiterHost;
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

  async clearGlobals() {
    globals.clearMemoryFiles();
    globals.stopCollectProcessInfo();
  }

  async launchBrowser() {
    let args = [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      "--enable-experimental-extension-apis"
    ];

    if (this.fpsMode) {
      args.push("--show-fps-counter",
        "--enable-logging=stderr",
        "--vmodule=heads_up_display_layer_*=1");
    }
    if (this.browser) {
      await PptrUtils.close(this.browser);
    }
    this.browser = await PptrUtils.launch({ args });
  }

  /**
   * @description: save performance metrics into disk. don't override this method
   */
  async saveMetircsIntoDisk() {
    let fileName = this.name();
    if (this.report) {
      await FileService.saveReportIntoDisk(this.report, fileName);
    }
    if (this.artifacts) {
      await FileService.saveArtifactsIntoDisk(this.artifacts, fileName);
      await FileService.saveTracesIntoDisk(this.artifacts, fileName);
      await FileService.saveMemoryIntoDisk(this.artifacts, fileName);
    }
    if (this.data) {
      await FileService.saveDataIntoDisk(this.data, fileName);
    }
  }

  /**
   * @description: scene pre handle
   */
  async preHandle() {
    this.config = new SceneConfig();
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

  /**
   * @description: save performance metrics into db
   */
  async saveMetircsIntoDb(): Promise<SceneDto> {
    let sceneDto = await MetricService.createScene(this.taskDto, this);

    await MetricService.createPerformance(sceneDto, this);

    await MetricService.createPerformanceItem(sceneDto, this);

    if (this.fpsMode) {
      await MetricService.createFpsItem(sceneDto, this);
    }

    return sceneDto;
  }

  async afterSaveMetrics(sceneDto: SceneDto) {
    if (!sceneDto) {
      return;
    }

    if (this.supportDashboard() && !this.fpsMode) {
      await DashboardService.addItem(this.taskDto, sceneDto);
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

  /**
   * @description avoid nodeJS out of memory
   */
  clearReportCache() {
    delete this.data;
    delete this.report;
    delete this.artifacts;
  }

  /**
   * @description: get scene name
   */
  name(): string {
    let prefix = this.fpsMode ? "FPS." : "";
    if (this.config && this.config.name !== "") {
      return `${prefix}${this.constructor.name}.${this.config.name}`;
    } else {
      return `${prefix}${this.constructor.name}`;
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

  supportFps(): boolean {
    return false;
  }

  openFpsMode() {
    if (this.supportFps()) {
      this.fpsMode = true;
    }
  }

  supportDashboard(): boolean {
    return false;
  }
}

export { Scene };
