/*
 * @Author: doyle.wu
 * @Date: 2018-12-07 10:16:51
 */
require("dotenv").config();
import { Config } from './config';
import { initModel, closeDB } from "./models";
import { FileService, MetriceService } from "./services";
import { LogUtils, PptrUtils } from "./utils";
import {
  Scene,
  LoginScene,
  RefreshScene,
  OfflineScene,
  SwitchConversationScene,
  SearchScene,
  FetchGroupScene
} from "./scenes";

const logger = LogUtils.getLogger(__filename);

(async () => {
  // init
  await initModel();
})().then(async () => {
  let exitCode = 1;
  try {
    let startTime = Date.now();

    let taskDto = await MetriceService.createTask();

    // check report dir
    await FileService.checkReportPath();

    // run scenes
    let host = Config.jupiterHost;
    let scenes: Array<Scene> = [
      new LoginScene(`${host}`, taskDto),
      new RefreshScene(`${host}`, taskDto),
      new OfflineScene(`${host}`, taskDto),
      new SwitchConversationScene(`${host}`, taskDto, [
        "506503174",
        "506445830"
      ]),
      new SearchScene(`${host}`, taskDto, ["John", "Doe", "Team", "kamino"]),
      new FetchGroupScene(`${host}`, taskDto)
    ];

    let result = true;
    for (let s of scenes) {
      result = (await s.run()) && result;
    }

    if (result) {
      exitCode = 0;
    }
    // generate report index.html
    await FileService.generateReportIndex();

    let endTime = Date.now();

    // 1: success  0: failure
    await MetriceService.updateTaskForEnd(taskDto, result ? "1" : "0");

    logger.info(`total cost ${endTime - startTime}ms, result: ${result}`);
  } catch (err) {
    logger.error(err);
  } finally {
    // release resources
    await closeDB;
    await PptrUtils.closeAll();

    process.exitCode = exitCode;
    process.exit(process.exitCode);
  }
});
