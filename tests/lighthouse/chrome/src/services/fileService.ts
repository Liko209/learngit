/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 20:14:14
 */
import * as fs from 'fs';
import { LogUtils } from '../utils';
import { Config } from '../config';

const logger = LogUtils.getLogger(__filename);

const REPORT_DIR_PATH = `${process.cwd()}/${Config.reportUri}`;

class FileService {
  /**
   * @description: check report path, not exist will create
   */
  static async checkReportPath() {
    if (!fs.existsSync(REPORT_DIR_PATH)) {
      fs.mkdirSync(REPORT_DIR_PATH);
    }
  }

  /**
   * @description: generate lighthouse report index
   */
  static async generateReportIndex() {
    let files = fs.readdirSync(REPORT_DIR_PATH), names = [], tracesFiles = [];
    if (!files || files.length === 0) {
      return;
    }
    let html = fs.readFileSync(`${process.cwd()}/src/index.template.html`, 'utf8');

    for (let file of files) {
      if (file.endsWith('.html') && file !== 'index.html' && file !== 'Traces.html') {
        names.push(file.substr(0, file.length - 5));
      }

      if (file.endsWith('.traces.json')) {
        tracesFiles.push(file);
      }
    }
    if (names.length === 0) {
      return;
    }
    names.sort();

    if (tracesFiles.length !== 0) {
      names.push('Traces');
      let htmlArray = ['<!doctype html><html><head></head><body>'];
      for (let t of tracesFiles) {
        htmlArray.push('<div style="margin:15px 130px">', `<a href="${t}" download="${t}" target="_blank">`, t, '</a>', '</div>');
      }
      htmlArray.push('</body></html>');

      let tracesPath = `${REPORT_DIR_PATH}/Traces.html`;
      fs.writeFileSync(tracesPath, htmlArray.join(''));
    }

    html = html.replace('$$FILE_LIST$$', JSON.stringify(names));
    html = html.replace('$$DASHBOARD_URL$$', Config.dashboardUrl);

    let indexPath = `${REPORT_DIR_PATH}/index.html`;

    fs.writeFileSync(indexPath, html);
    logger.info(`index.html has saved.[${indexPath}]`);
  }

  /**
   * @description: save report into disk
   */
  static async saveReportIntoDisk(report: any, fileName: string) {
    let reportPath = `${REPORT_DIR_PATH}/${fileName}.html`;
    fs.writeFileSync(reportPath, report);
    logger.info(`report has saved.[${reportPath}]`);
  }

  /**
   * @description: save artifacts into disk
   */
  static async saveArtifactsIntoDisk(artifacts: any, fileName: string) {
    let artifactsPath = `${REPORT_DIR_PATH}/${fileName}.artifacts.json`;
    fs.writeFileSync(artifactsPath, JSON.stringify(artifacts));
    logger.info(`artifacts has saved.[${artifactsPath}]`);
  }

  /**
   * @description: save traces into disk
   */
  static async saveTracesIntoDisk(artifacts: any, fileName: string) {
    if (artifacts.traces && artifacts.traces.defaultPass && artifacts.traces.defaultPass.traceEvents) {
      let tracesPath = `${REPORT_DIR_PATH}/${fileName}.traces.json`;
      fs.writeFileSync(tracesPath, JSON.stringify(artifacts.traces.defaultPass.traceEvents));
      logger.info(`traces has saved.[${tracesPath}]`);
    }
  }

  /**
   * @description: save data into disk
   */
  static async saveDataIntoDisk(data: any, fileName: string) {
    let dataPath = `${REPORT_DIR_PATH}/${fileName}.data.json`;
    fs.writeFileSync(dataPath, JSON.stringify(data));
    logger.info(`data has saved.[${dataPath}]`);
  }
}

export {
  FileService
}
