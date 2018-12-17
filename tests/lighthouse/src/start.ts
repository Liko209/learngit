/*
 * @Author: doyle.wu
 * @Date: 2018-12-07 10:16:51
 */
require('dotenv').config();
import { initModel } from './models';
import { dbUtils } from './utils/DbUtils';
import { fileService } from './services/FileService';
import { Scene, LoginScene, RefreshScene, OfflineScene } from './scenes';
import { logUtils } from './utils/LogUtils';

console.log(process.env);

const logger = logUtils.getLogger(__filename);
let startTime = Date.now();

initModel().then(async () => {
    // check report dir
    await fileService.checkReportPath();
}).then(async () => {
    // run scenes
    let host = process.env.JUIPTER_HOST;
    let scenes: Array<Scene> = [
        new LoginScene(`${host}`),
        new RefreshScene(`${host}`),
        new OfflineScene(`${host}`),
    ];

    for (let s of scenes) {
        await s.run();
    }
}).then(async () => {
    // generate report index.html
    await fileService.generateReportIndex();

}).then(async () => {
    // release resources
    await dbUtils.close();

    let endTime = Date.now();

    logger.info(`total cost ${endTime - startTime}ms`);
});