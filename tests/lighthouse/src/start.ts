/*
 * @Author: doyle.wu
 * @Date: 2018-12-07 10:16:51
 */
require('dotenv').config();
import { initModel } from './models';
import { metriceService } from './services/MetricService';
import { fileService } from './services/FileService';
import { Scene, LoginScene, RefreshScene, OfflineScene } from './scenes';
import { logUtils } from './utils/LogUtils';
import { dbUtils } from './utils/DbUtils';
import { puppeteerUtils } from './utils/PuppeteerUtils';

const logger = logUtils.getLogger(__filename);

(async () => {
    // init
    await initModel();
})().then(async () => {
    let exitCode = 1;
    try {
        let startTime = Date.now();

        let taskDto = await metriceService.createTask();

        // check report dir
        await fileService.checkReportPath();

        // run scenes
        let host = process.env.JUPITER_HOST;
        let scenes: Array<Scene> = [
            new LoginScene(`${host}`, taskDto),
            new RefreshScene(`${host}`, taskDto),
            new OfflineScene(`${host}`, taskDto),
        ];

        let result = true;
        for (let s of scenes) {
            result = await s.run() && result;
        }

        if (result) {
            exitCode = 0;
        }
        // generate report index.html
        await fileService.generateReportIndex();

        let endTime = Date.now();

        // 1: success  2: failure
        await metriceService.updateTaskForEnd(taskDto, result ? '1' : '2');

        logger.info(`total cost ${endTime - startTime}ms, result: ${result}`);
    } catch (err) {
        logger.error(err);
    } finally {
        // release resources
        await dbUtils.close();
        await puppeteerUtils.closeAll();

        // process.exitCode = exitCode;
        // process.exit(process.exitCode);
    }
});