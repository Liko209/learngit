/*
 * @Author: doyle.wu
 * @Date: 2018-12-07 10:16:51
 */
require("dotenv").config();
import { Config } from './config';
import { initModel, closeDB } from "./models";
import { FileService, MetricService, DashboardService } from "./services";
import { LogUtils, PptrUtils } from "./utils";
import * as scenes from "./scenes";

const logger = LogUtils.getLogger(__filename);

(async () => {
  // init
  await initModel();
})().then(async () => {
  let exitCode = 1;
  let skipRun = false;
  try {
    let startTime = Date.now();

    // check report dir
    await FileService.checkReportPath();

    const versionInfo = await DashboardService.getVersionInfo();
    await DashboardService.getVersionInfo(Config.jupiterStageHost);
    await DashboardService.getVersionInfo(Config.jupiterDevelopHost);

    await MetricService.createVersion(versionInfo.jupiterVersion);
    const isReleaseRun = Config.jupiterHost === Config.jupiterReleaseHost;

    if (!isReleaseRun) {
      if (Config.jupiterHost === Config.jupiterStageHost) {
        const developVersion = await DashboardService.getVersionInfo(Config.jupiterDevelopHost);
        if (versionInfo.jupiterVersion === developVersion.jupiterVersion) {
          exitCode = 0;
          skipRun = true;
          logger.info(`stage[${versionInfo.jupiterVersion}] has released, so skip`);
          return;
        }
      }
    }
    let taskDto = await MetricService.createTask(versionInfo.jupiterVersion);

    // run scenes
    const sceneNames = Object.keys(scenes).filter(name => {
      const _name = name.toLowerCase();
      if (_name === 'scene' || !_name.endsWith('scene')) {
        return false;
      }
      const includeScene = Config.includeScene;
      if (includeScene.length === 0) {
        return true;
      }

      for (let s of includeScene) {
        if (_name === s.toLowerCase()) {
          return true;
        }
      }
      return false;
    });

    const sceneArray = [];
    for (let name of sceneNames) {
      sceneArray.push(new scenes[name](taskDto, versionInfo.jupiterVersion));
    }

    let result = true, scene;
    while (sceneArray.length > 0) {
      try {
        scene = sceneArray.shift();
        result = (await scene.run()) && result;
        scene.clearReportCache();
        if (Config.runFps && scene.supportFps()) {
          scene.openFpsMode();
          result = (await scene.run()) && result;
          scene.clearReportCache();
        }
      } catch (err) {
        logger.error(err);
      }
    }

    if (result) {
      exitCode = 0;
    }

    let endTime = Date.now();

    // 1: success  0: failure
    await MetricService.updateTaskForEnd(taskDto, result ? "1" : "0");

    logger.info(`total cost ${endTime - startTime}ms, result: ${result}`);
  } catch (err) {
    logger.error(err);
  } finally {
    if (!skipRun) {
      await DashboardService.buildReport();
      // generate report index.html
      await FileService.generateReportIndex();
    }

    // release resources
    await closeDB();
    await PptrUtils.closeAll();

    process.exitCode = exitCode;
    process.exit(process.exitCode);
  }
});
