/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 13:40:12
 */
import * as scenarios from './scenario';
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

    let list: Array<scenarios.Scenario> = [
      new scenarios.LoginScenario(taskDto),
      new scenarios.RefreshScenario(taskDto),
      new scenarios.OfflineScenario(taskDto),
      new scenarios.SearchScenario(taskDto, ["John", "Doe", "Team", "kamino"]),
      new scenarios.SwitchConversationScenario(taskDto, [
        "506503174",
        "506445830"
      ]),
      new scenarios.FetchGroupScenario(taskDto)
    ];

    let result = true;
    for (let s of list) {
      result = (await s.run()) && result;
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
