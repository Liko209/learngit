/*
 * @Author: doyle.wu
 * @Date: 2018-12-07 10:16:51
 */
require('dotenv').config();
import { initModel } from './models';
import { dbUtils } from './utils/DbUtils';
import { metriceService } from './services/MetricService';
import { fileService } from './services/FileService';
import { Scene, LoginScene, RefreshScene, OfflineScene } from './scenes';
import { logUtils } from './utils/LogUtils';

const logger = logUtils.getLogger(__filename);

initModel().then(async () => {
    let startTime = Date.now();

    let taskDto = await metriceService.createTask();

    // check report dir
    await fileService.checkReportPath();

    // run scenes
    let host = process.env.JUPITER_HOST;
    let scenes: Array<Scene> = [
        new Scene(`${host}`, taskDto),
        // new LoginScene(`${host}`, taskDto),
        // new RefreshScene(`${host}`, taskDto),
        // new OfflineScene(`${host}`, taskDto),
    ];

    for (let s of scenes) {
        await s.run();
    }

    // generate report index.html
    await fileService.generateReportIndex();

    let endTime = Date.now();

    await metriceService.updateTaskForEnd(taskDto);

    logger.info(`total cost ${endTime - startTime}ms`);
}).then(async () => {
    // release resources
    await dbUtils.close();
});