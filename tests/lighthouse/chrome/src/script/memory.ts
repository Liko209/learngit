/*
 * @Author: doyle.wu
 * @Date: 2019-07-03 10:12:25
 */
import { MetricService } from '../services';
import { initModel, closeDB, TaskDto, SceneDto } from '../models';

(async () => {
  try {
    await initModel();

    let scene;
    let ids = [];
    // for (let id = 1; id <= 1662; id++) {
    //   ids.push(id);
    // }
    for (let id of ids) {
      scene = await SceneDto.findByPk(id);
      await MetricService.summaryMemory(scene);
    }
  } catch (err) {
    //console.log(err);
  } finally {
    await closeDB();
  }
})();
