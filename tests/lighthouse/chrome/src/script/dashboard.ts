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
    const longTasks = [{
      name: 'self',
      entryType: 'longtask',
      startTime: 44124.28,
      duration: 58.66000000241911,
      attribution: []
    }, {
      name: 'self',
      entryType: 'longtask',
      startTime: 44124.28,
      duration: 158.66000000241911,
      attribution: []
    }, {
      name: 'self',
      entryType: 'longtask',
      startTime: 45473.6699999994,
      duration: 200.09500000136904,
      attribution: []
    }, {
      name: 'self',
      entryType: 'longtask',
      startTime: 45882.34999999986,
      duration: 302.34499999968102,
      attribution: []
    }];

    await DashboardService.addItem(await TaskDto.findByPk(391), await SceneDto.findByPk(135), longTasks);

    await DashboardService.buildReport();
  } catch (err) {
    //console.log(err);
  } finally {
    await closeDB();
  }
})();
