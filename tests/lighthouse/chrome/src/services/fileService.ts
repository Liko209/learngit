/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 20:14:14
 */
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';
import { LogUtils } from '../utils';
import { Config } from '../config';
import * as uuid from 'uuid/v4';
import * as extract from "extract-zip";

const logger = LogUtils.getLogger(__filename);

const REPORT_DIR_PATH = path.join(process.cwd(), Config.reportUri);

const HEAP_DIR_PATH = path.join(REPORT_DIR_PATH, 'heaps');

const fileServerUrl = Config.fileServerUrl;
class FileService {
  /**
   * @description: check report path, not exist will create
   */
  static async checkReportPath() {
    if (!fs.existsSync(REPORT_DIR_PATH)) {
      fs.mkdirSync(REPORT_DIR_PATH);
    }

    if (fs.existsSync(HEAP_DIR_PATH)) {
      let files = fs.readdirSync(HEAP_DIR_PATH);
      for (let file of files) {
        let filePath = path.join(HEAP_DIR_PATH, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      fs.mkdirSync(HEAP_DIR_PATH);
    }
  }

  /**
   * @description: generate lighthouse report index
   */
  static async generateReportIndex() {
    let files = fs.readdirSync(REPORT_DIR_PATH), names = [], tracesFiles = [], memoryFiles = [];
    if (!files || files.length === 0) {
      return;
    }
    let html = fs.readFileSync(path.join(process.cwd(), 'src', 'index.template.html'), 'utf8');

    for (let file of files) {
      if (file.endsWith('.html')
        && file !== 'index.html'
        && file !== 'Traces.html'
        && file !== 'Heap.html'
        && file !== 'dashboard.html') {
        names.push(file.substr(0, file.length - 5));
      }

      if (file.endsWith('.traces.json')) {
        tracesFiles.push(file);
      }

      if (file.endsWith('.heapsnapshot')) {
        memoryFiles.push(file);
      }
    }

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

      let tracesPath = path.join(REPORT_DIR_PATH, `Traces.html`);
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

      let memoryPath = path.join(REPORT_DIR_PATH, `Heap.html`);
      fs.writeFileSync(memoryPath, htmlArray.join(''));
    }

    if (names.length > 0) {
      names.sort();
    }

    html = html.replace('$$FILE_LIST$$', JSON.stringify(names));
    html = html.replace('$$DASHBOARD_URL$$', Config.dashboardUrl);

    let indexPath = path.join(REPORT_DIR_PATH, `index.html`);

    fs.writeFileSync(indexPath, html);
    logger.info(`index.html has saved.[${indexPath}]`);
  }

  /**
   * @description: save report into disk
   */
  static async saveReportIntoDisk(report: any, fileName: string) {
    if (report) {
      let reportPath = path.join(REPORT_DIR_PATH, `${fileName}.html`);
      fs.writeFileSync(reportPath, report);
      logger.info(`report has saved.[${reportPath}]`);
    }
  }

  /**
   * @description: save artifacts into disk
   */
  static async saveArtifactsIntoDisk(artifacts: any, fileName: string) {
    if (artifacts) {
      let artifactsPath = path.join(REPORT_DIR_PATH, `${fileName}.artifacts.json`);
      fs.writeFileSync(artifactsPath, JSON.stringify(artifacts));
      logger.info(`artifacts has saved.[${artifactsPath}]`);
    }
  }

  /**
   * @description: save traces into disk
   */
  static async saveTracesIntoDisk(artifacts: any, fileName: string) {
    if (artifacts.traces && artifacts.traces.defaultPass && artifacts.traces.defaultPass.traceEvents) {
      let tracesPath = path.join(REPORT_DIR_PATH, `${fileName}.traces.json`);
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
      let memoryPath = path.join(REPORT_DIR_PATH, `${fileName}.heapsnapshot`);
      fs.writeFileSync(memoryPath, conent);
      logger.info(`memory has saved.[${memoryPath}]`);
    }
  }

  /**
   * @description: save data into disk
   */
  static async saveDataIntoDisk(data: any, fileName: string) {
    if (data) {
      let dataPath = path.join(REPORT_DIR_PATH, `${fileName}.data.json`);
      fs.writeFileSync(dataPath, JSON.stringify(data));
      logger.info(`data has saved.[${dataPath}]`);
    }
  }

  /**
   * @description: save dashboard into disk
   */
  static async saveDashboardIntoDisk(dashboard: string) {
    let dashboardPath = path.join(REPORT_DIR_PATH, 'dashboard.html');
    fs.writeFileSync(dashboardPath, dashboard);
    logger.info(`dashboard has saved.[${dashboardPath}]`);
  }

  /**
   * @description: save dashboard into disk
   */
  static async saveGlipMessageIntoDisk(message: string) {
    let messagePath = path.join(REPORT_DIR_PATH, 'glip.txt');
    fs.writeFileSync(messagePath, message);
    logger.info(`glip message has saved.[${messagePath}]`);
  }

  /**
  * @description: save heap into disk
  */
  static async saveHeapIntoDisk(heap: string): Promise<string> {
    if (Config.takeHeapSnapshot) {
      let heapPath = path.join(HEAP_DIR_PATH, `${uuid()}.heapsnapshot`);
      fs.writeFileSync(heapPath, heap);
      logger.info(`heap has saved.[${heapPath}]`);
      return heapPath;
    } else {
      return '';
    }
  }

  /**
   * @description: save heap int disk
   */
  static async trackingHeapObjects(driver): Promise<string> {
    let heapPath = path.join(HEAP_DIR_PATH, `${uuid()}.heapsnapshot`);

    if (!Config.takeHeapSnapshot) {
      return heapPath;
    }

    logger.info('tracking heap object...');

    const listener = (data) => {
      if (data.chunk) {
        fs.appendFileSync(heapPath, data.chunk);
      }
    }

    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.enable');

    driver.on('HeapProfiler.addHeapSnapshotChunk', listener);
    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.startTrackingHeapObjects');
    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.stopTrackingHeapObjects');

    driver.off('HeapProfiler.addHeapSnapshotChunk', listener);

    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.disable');

    return heapPath;
  }

  public static async downloadZip(url: string, fileName: string): Promise<string> {

    const dirPath = path.join(process.cwd(), 'downloads');
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    if (fs.existsSync(filePath)) {
      logger.info(`[${filePath}] is exists, skip download.`);
      return filePath;
    }

    logger.info(`start download [${url}].`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    return filePath;
  }

  public static async extractProfiles(source): Promise<string> {
    const parentDir = path.join(process.cwd(), 'profiles');
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir);
    }

    const targetDir = path.join(parentDir, uuid());
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    if (!fs.existsSync(source)) {
      return targetDir;
    }
    let first = true, dir;
    return new Promise((resolved) => {
      extract(source, {
        dir: targetDir,
        defaultDirMode: 0x777,
        defaultFileMode: 0x777,
        onEntry: (entry) => {
          if (first) {
            first = false;
            dir = entry.fileName
          }
        }
      }, (err) => {
        resolved(dir ? path.join(targetDir, dir) : targetDir);
      });
    });
  }

  public static cleanProfiles(): void {
    const profilePath = path.join(process.cwd(), 'profiles');

    if (!fs.existsSync(profilePath)) {
      return;
    }

    fs.readdirSync(profilePath).forEach((entry) => {
      if (entry.indexOf('-') < 0) {
        return;
      }

      const entryPath = path.join(profilePath, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        FileService.deleteDir(entryPath);
      }
    });
  }

  public static deleteDir(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((entry) => {
        const entryPath = path.join(dirPath, entry);
        if (fs.lstatSync(entryPath).isDirectory()) {
          FileService.deleteDir(entryPath);
        } else {
          fs.unlinkSync(entryPath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }
}

export {
  FileService
}
