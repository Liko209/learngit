/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 20:14:14
 */
import * as fs from 'fs';
import { logUtils } from '../utils/LogUtils';

const logger = logUtils.getLogger(__filename);

const REPORT_DIR_PATH = `${process.cwd()}/${process.env.REPORT_URI}`;
class FileService {
    /**
     * @description: check report path, not exist will create
     */
    async checkReportPath() {
        if (!fs.existsSync(REPORT_DIR_PATH)) {
            fs.mkdirSync(REPORT_DIR_PATH);
        }
    }

    /**
     * @description: generate lighthouse report index
     */
    async generateReportIndex() {
        let files = fs.readdirSync(REPORT_DIR_PATH), names = [];
        if (!files || files.length === 0) {
            return;
        }
        let html = fs.readFileSync(`${process.cwd()}/src/index.template.html`, 'utf8');

        for (let file of files) {
            if (file.endsWith('.html') && file !== 'index.html') {
                names.push(file.substr(0, file.length - 5));
            }
        }
        if (names.length === 0) {
            return;
        }
        names.sort();

        html = html.replace('$$FILE_LIST$$', JSON.stringify(names));

        let indexPath = `${REPORT_DIR_PATH}/index.html`;

        fs.writeFileSync(indexPath, html);
        logger.info(`index.html has saved.[${indexPath}]`);
    }

    /**
     * @description: save report into disk
     */
    async saveReportIntoDisk(report: any, fileName: string) {
        let reportPath = `${REPORT_DIR_PATH}/${fileName}.html`;
        fs.writeFileSync(reportPath, report);
        logger.info(`report has saved.[${reportPath}]`);
    }

    /**
     * @description: save artifacts into disk
     */
    async saveArtifactsIntoDisk(artifacts: any, fileName: string) {
        let artifactsPath = `${REPORT_DIR_PATH}/${fileName}.artifacts.json`;
        fs.writeFileSync(artifactsPath, JSON.stringify(artifacts));
        logger.info(`data has saved.[${artifactsPath}]`);
    }

    /**
     * @description: save data into disk
     */
    async saveDataIntoDisk(data: any, fileName: string) {
        let dataPath = `${REPORT_DIR_PATH}/${fileName}.data.json`;
        fs.writeFileSync(dataPath, JSON.stringify(data));
        logger.info(`data has saved.[${dataPath}]`);
    }
}

const fileService = new FileService();

export {
    fileService
}