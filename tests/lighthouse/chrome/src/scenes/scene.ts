/*
 * @Author: doyle.wu
 * @Date: 2019-08-26 15:46:12
 */
import { Config } from "../config";
import { TaskDto, SceneDto } from "../models";
import { LogUtils, PptrUtils } from "../utils";
import { SceneConfig } from "./config/sceneConfig";
import { globals } from "../globals";
import { FileService, MetricService, DashboardService } from "../services";

const EXTENSION_PATH = `${process.cwd()}/extension`;
type Timing = { startTime: Date; endTime: Date; total: number };

class Scene {
  protected RETRY_COUNT = 3;
  protected config: SceneConfig;
  protected url: string;
  protected taskDto: TaskDto;
  protected timing: Timing;
  protected fpsMode: boolean = false;
  protected appVersion;
  protected browser;
  protected logger;
  protected artifacts;
  protected data;
  protected report;

  constructor(taskDto: TaskDto, appVersion: string) {
    this.url = Config.jupiterHost;
    this.taskDto = taskDto;
    this.appVersion = appVersion;
    this.logger = LogUtils.getLogger(__filename);
  }

  tags(): Array<string> {
    return [];
  }

  async run(): Promise<boolean> {
    return true;
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

    const profileUrl = this.getProfileUrl();
    if (profileUrl) {
      const downloadPath = await FileService.downloadZip(profileUrl, `${this.name()}.zip`);
      const profilePath = await FileService.extractProfiles(downloadPath);
      args.push(`--user-data-dir=${profilePath}`);
    }

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

    if (!this.supportDashboard() || this.fpsMode) {
      return;
    }

    const longTasks = [];
    const gatherer = this.artifacts['LongTaskGatherer'];
    if (gatherer && gatherer.longTasks) {
      longTasks.push(...gatherer.longTasks);
    }

    await DashboardService.addItem(this.taskDto, sceneDto, longTasks);
  }

  /**
   * @description: scene pre handle
   */
  async preHandle() {
    this.config = new SceneConfig();
  }

  clearReportCache() {
    delete this.data;
    delete this.report;
    delete this.artifacts;
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

  getTiming(): Timing {
    return this.timing;
  }

  finallyUrl(): string {
    return this.url;
  }

  getAppVersion(): string {
    return this.appVersion;
  }

  getData() {
    return this.data;
  }

  getArtifacts() {
    return this.artifacts;
  }

  getProfileUrl(): string {
    return undefined;
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
}


export {
  Scene
}
