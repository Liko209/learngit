/*
 * @Author: doyle.wu
 * @Date: 2019-07-08 17:53:30
 */

import { Config } from '../config';
import { globals } from '../globals';
import { initModel, closeDB, TaskDto, SceneDto } from '../models';
import { DashboardService } from '../services';
(async () => {
  try {
    await initModel();

    // Config.takeHeapSnapshot = true;
    // globals.pushMemoryFilePath('/Users/doyle.wu/Documents/Workspace/js/Fiji/tests/lighthouse/chrome/reports/heaps2/47c35530-e2b5-4317-80c3-51c8b3f57c9c.heapsnapshot');
    // globals.pushMemoryFilePath('/Users/doyle.wu/Documents/Workspace/js/Fiji/tests/lighthouse/chrome/reports/heaps2/bd7d0c3d-2481-4851-b4db-93e324f26c38.heapsnapshot');

    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1646));
    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1647));
    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1648));
    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1649));
    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1650));
    await DashboardService.addItem(await TaskDto.findByPk(237), await SceneDto.findByPk(1651));

    await DashboardService.buildReport();
  } catch (err) {
    console.log(err);
  } finally {
    await closeDB();
  }
})();
