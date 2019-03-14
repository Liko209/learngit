/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 08:58:50
 */
import { ScenearioRetryCount } from '../constants';
import { LogUtils, PptrUtils, JupiterUtils } from '../utils';
import { Config } from '../config';
import { Timing } from '../dto';
import { HomePage } from '../pages';
import { TaskDto } from '../model';
import { FileService, MetricService } from '../service';
import {
  LightHouseConfig,
  lighthouse,
  reportGenerater,
  ElectronConnection,
  gatherers,
  closeElectron
} from '../lighthouse';

class Scene {
  protected browser;
  protected url: string;
  protected timing: Timing;
  protected logger = LogUtils.getLogger(__filename);
  protected lightHouseConfig: LightHouseConfig;
  protected taskDto: TaskDto;
  protected data;
  protected report;
  protected artifacts;

  constructor(taskDto: TaskDto, url?: string) {
    this.taskDto = taskDto;
    if (url) {
      this.url = url;
    } else {
      this.url = Config.jupiterHost;
    }
  }

  async run(): Promise<boolean> {
    this.logger.info(`start run scene --> ${this.name()}`);
    for (let i = 0; i < ScenearioRetryCount; i++) {
      try {
        const startTime = new Date();

        await this.launchBrowser();

        await this.resetStorage();

        await this.login();

        await this.preHandle();

        this.adjustCustomGatherer();

        await this.collectData();

        const endTime = new Date();
        this.timing = {
          startTime,
          endTime,
          totalTime: endTime.getTime() - startTime.getTime()
        };
      } catch (err) {
        this.logger.error(err);
      }

      if (this.isSuccess()) {
        this.logger.info(`start run scene --> ${this.name()} run successed.`);
        await this.saveMetircsIntoDisk();

        await this.saveMetircsIntoDb();
        return true;
      }
    }

    // save last failure report, and not save result into db.
    await this.saveMetircsIntoDisk();
    return false;
  }

  protected async launchBrowser() {
    await closeElectron();
    this.browser = await PptrUtils.launch();
  }

  protected async resetStorage() {
    const connection = new ElectronConnection(Config.electronDebugPort, Config.electronHost);
    await connection.connect();

    const origin = new URL(this.url).origin;
    await connection.sendCommand('Storage.clearDataForOrigin', {
      origin,
      storageTypes: [
        'appcache',
        'cookies',
        'file_systems',
        'indexeddb',
        'local_storage',
        'shader_cache',
        'websql',
        'service_workers',
        'cache_storage',
      ].join(',')
    });
  }

  protected async login() {
    let homePage = new HomePage({ browser: this.browser });

    let browser = await homePage.browser();

    let authUrl = await JupiterUtils.getAuthUrl(this.url, browser);

    let page = await homePage.page();

    await page.goto(authUrl);

    await homePage.waitForCompleted();

    PptrUtils.close(this.browser);

    await this.launchBrowser();
  }

  protected async preHandle() {
    this.lightHouseConfig = new LightHouseConfig();

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.HomePageGatherer()
    });

    this.lightHouseConfig.passes[0].gatherers.push({
      instance: new gatherers.LighthouseHacker()
    });
  }

  private adjustCustomGatherer() {
    this.lightHouseConfig.settings.url = this.url;

    let passes = this.lightHouseConfig.passes;
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
    this.lightHouseConfig.audits.push({
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

  protected async collectData() {
    try {
      const { lhr, artifacts } = await lighthouse(
        this.finallyUrl(),
        {
          port: new URL(this.browser.wsEndpoint()).port,
          logLevel: "info",
          disableStorageReset: true
        },
        this.lightHouseConfig.toJSON(),
        new ElectronConnection(Config.electronDebugPort, Config.electronHost)
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
      await PptrUtils.close(this.browser);
    }
  }

  protected isSuccess() {
    if (this.data) {
      let { categories } = this.data;
      if (categories) {
        let scores = {};
        let cnt = 0;
        let keys = ['performance', 'pwa', 'accessibility', 'best-practices', 'seo'];
        for (let key of keys) {
          if (
            categories[key] &&
            categories[key].score != null && categories[key].score >= 0
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

  protected async saveMetircsIntoDisk() {
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

  protected async saveMetircsIntoDb() {
    let sceneDto = await MetricService.createScene(this.taskDto, this);

    await MetricService.createPerformance(sceneDto, this);

    await MetricService.createPerformanceItem(sceneDto, this);

    return sceneDto;
  }

  protected finallyUrl(): string {
    return this.url;
  }

  /**
   * @description avoid nodeJS out of memory
   */
  clearReportCache() {
    delete this.data;
    delete this.report;
    delete this.artifacts;
  }

  name(): string {
    if (this.lightHouseConfig && this.lightHouseConfig.name !== "") {
      return `${this.constructor.name}.${this.lightHouseConfig.name}`;
    } else {
      return `${this.constructor.name}`;
    }
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

export {
  Scene
}

