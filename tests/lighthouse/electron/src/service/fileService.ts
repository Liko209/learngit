/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 14:25:17
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';
import { LogUtils } from '../utils';
import { Config } from '../config';

const logger = LogUtils.getLogger(__filename);

const REPORT_DIR_PATH = `${process.cwd()}/${Config.reportUri}`;

if (!fs.existsSync(REPORT_DIR_PATH)) {
  fs.mkdirSync(REPORT_DIR_PATH);
}

const fileServerUrl = Config.fileServerUrl;

class FileService {

  /**
   * @description: generate lighthouse report index
   */
  static async generateReportIndex() {
    let files = fs.readdirSync(REPORT_DIR_PATH), names = [], tracesFiles = [], memoryFiles = [];
    if (!files || files.length === 0) {
      return;
    }
    let html = fs.readFileSync(`${process.cwd()}/src/index.template.html`, 'utf8');
    for (let file of files) {
      if (file.endsWith('.html')
        && file !== 'index.html'
        && file !== 'Traces.html'
        && file !== 'Heap.html') {
        names.push(file.substr(0, file.length - 5));
      }

      if (file.endsWith('.traces.json')) {
        tracesFiles.push(file);
      }

      if (file.endsWith('.heapsnapshot')) {
        memoryFiles.push(file);
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
        if (Config.fileUpload) {
          const stream = fs.createReadStream(path.join(REPORT_DIR_PATH, t));

          const form = new FormData();
          form.append('file', stream);
          const response = await axios.post(`${fileServerUrl}/api/upload`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity
          });
          htmlArray.push('<div style="margin:15px 130px">', `<a href="${fileServerUrl}/download/${response.data.fileName}" target="_blank">`, t, '</a>', '</div>');
        } else {
          htmlArray.push('<div style="margin:15px 130px">', `<a href="${t}" target="_blank">`, t, '</a>', '</div>');
        }
      }
      htmlArray.push('</body></html>');

      let tracesPath = `${REPORT_DIR_PATH}/Traces.html`;
      fs.writeFileSync(tracesPath, htmlArray.join(''));
    }

    if (memoryFiles.length !== 0) {
      names.push('Heap');
      let htmlArray = ['<!doctype html><html><head></head><body>'];
      for (let m of memoryFiles) {
        if (Config.fileUpload) {
          const stream = fs.createReadStream(path.join(REPORT_DIR_PATH, m));

          const form = new FormData();
          form.append('file', stream);
          const response = await axios.post(`${fileServerUrl}/api/upload`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity
          });
          htmlArray.push('<div style="margin:15px 130px">', `<a href="${fileServerUrl}/download/${response.data.fileName}" target="_blank">`, m, '</a>', '</div>');
        } else {
          htmlArray.push('<div style="margin:15px 130px">', `<a href="${m}" target="_blank">`, m, '</a>', '</div>');
        }
      }
      htmlArray.push('</body></html>');

      let memoryPath = `${REPORT_DIR_PATH}/Heap.html`;
      fs.writeFileSync(memoryPath, htmlArray.join(''));
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
   * @description: save memory into disk
   */
  static async saveMemoryIntoDisk(artifacts: any, fileName: string) {
    let gatherer = artifacts['MemoryGatherer'];
    if (gatherer && gatherer.data) {
      let conent = gatherer.data.join('');
      let memoryPath = `${REPORT_DIR_PATH}/${fileName}.heapsnapshot`;
      fs.writeFileSync(memoryPath, conent);
      logger.info(`memory has saved.[${memoryPath}]`);
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
