/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 13:40:12
 */
import * as scenes from './scene';
import { Config } from './config';
import { PptrUtils, LogUtils } from './utils';
import { initModel, closeDB } from './model';
import { MetricService, FileService } from './service';
import { hackLightHouse, startBlankServer, stopBlankServer } from './lighthouse';

const logger = LogUtils.getLogger(__filename);

(async () => {
  let exitCode = 1;
  try {
    let startTime = Date.now();

    await hackLightHouse();

    await startBlankServer();

    await initModel();

    let taskDto = await MetricService.createTask();

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
      sceneArray.push(new scenes[name](taskDto));
    }

    let result = true, scene;
    while (sceneArray.length > 0) {
      scene = sceneArray.shift();
      result = (await scene.run()) && result;
      scene.clearReportCache();
    }

    if (result) {
      exitCode = 0;
    }
    // generate report index.html
    await FileService.generateReportIndex();

    let endTime = Date.now();

    // 1: success  0: failure
    await MetricService.updateTaskForEnd(taskDto, result ? "1" : "0");

    logger.info(`total cost ${endTime - startTime}ms, result: ${result}`);
  } catch (err) {
    logger.error(err);
  } finally {
    // release resources
    await closeDB();
    await PptrUtils.closeAll();
    await stopBlankServer();

    process.exitCode = exitCode;
    process.exit(process.exitCode);
  }
})();
