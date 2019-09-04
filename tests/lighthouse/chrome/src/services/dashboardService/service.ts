/*
 * @Author: doyle.wu
 * @Date: 2019-07-05 09:39:56
 */

import * as os from 'os';
import * as fs from 'fs';
import * as plist from 'plist';
import * as jwt from 'jsonwebtoken';
import { LogUtils, PptrUtils } from '../../utils';
import { FileService } from '../fileService';
import { Config } from '../../config';
import { globals } from '../../globals';
import { HeapNode, parseMemorySnapshot } from '../../analyse';
import { Op } from 'sequelize';
import {
  TaskDto, SceneDto,
  LoadingTimeSummaryDto,
  VersionDto, LoadingTimeReleaseSummaryDto,
  MemorySummaryDto,
  MemoryDto
} from '../../models';
import { URLSearchParams } from 'url';
import { parseTracing, summariseTracing } from '../../tracing';
import {
  DashboardVersionInfo,
  SceneSummary,
  DashboardItem,
  MemoryDiffItem,
  DashboardPair,
  LongTask
} from './models';
import { getDashboardConfig } from './init';

const maxGoalValue = 2000;

const goalMap: {
  [key: string]: { [key: string]: number }
} = {};

const logger = LogUtils.getLogger(__filename);

const items: { [key: string]: DashboardItem } = {};

const formatMemorySize = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  while (size > 1024 && idx < units.length) {
    size = size / 1024.0;
    idx++;
  }
  return `${size.toFixed(2)} ${units[idx]}`;
}

const _config = getDashboardConfig();

let _versionInfo: { [key: string]: DashboardVersionInfo } = {};

class DashboardService {

  static async addItem(task: TaskDto, scene: SceneDto, longTasks: Array<LongTask>) {
    const sceneConfig = _config.scenes[scene.name];
    if (!sceneConfig || Object.keys(sceneConfig.metric).length === 0) {
      return;
    }

    const { currentSummary, lastSummary } = await DashboardService.summary(scene);

    const metric = sceneConfig.metric;

    const item: DashboardItem = new DashboardItem();
    item.metric = {};
    item.sceneId = scene.id;
    item.longTasks = longTasks;

    Object.keys(metric).forEach(key => {
      let currentItem = currentSummary.metric[key];
      if (!currentItem) {
        return;
      }
      let lastItem = lastSummary.metric[key] || {};
      item.metric[key] = {
        apiAvg: new DashboardPair(currentItem.apiAvg, lastItem['apiAvg'], 'ms'),
        apiMax: new DashboardPair(currentItem.apiMax, lastItem['apiMax'], 'ms'),
        apiMin: new DashboardPair(currentItem.apiMin, lastItem['apiMin'], 'ms'),
        apiTop90: new DashboardPair(currentItem.apiTop90, lastItem['apiTop90'], 'ms'),
        apiTop95: new DashboardPair(currentItem.apiTop95, lastItem['apiTop95'], 'ms'),
        handleCount: currentItem.handleCount
      }
    });

    await DashboardService.memorySummary(item);

    if (Object.keys(item.metric).length > 0) {
      if (currentSummary.startMemory && currentSummary.endMemory) {
        item.k = new DashboardPair(currentSummary.k, lastSummary.k, '');
        item.b = new DashboardPair(currentSummary.b, lastSummary.b, 'MB');
        item.startMemory = new DashboardPair(currentSummary.startMemory, lastSummary.startMemory, 'MB');
        if (lastSummary.startMemory && lastSummary.endMemory) {
          item.memoryGrowth = new DashboardPair(currentSummary.endMemory - currentSummary.startMemory, lastSummary.endMemory - lastSummary.startMemory, 'MB');
        } else {
          item.memoryGrowth = new DashboardPair(currentSummary.endMemory - currentSummary.startMemory, undefined, 'MB');
        }
      }
      items[scene.name] = item;
    }
  }

  private static async memorySummary(item: DashboardItem) {
    let result: Array<Array<MemoryDiffItem>> = new Array();
    item.memoryDiffArray = result;

    let memoryFileArray = globals.getMemoryFiles();
    logger.info(`memoryFileArray : ${JSON.stringify(memoryFileArray)}`);
    if (!memoryFileArray || memoryFileArray.length <= 1) {
      return;
    }
    let before: { [key: string]: Array<HeapNode> } = parseMemorySnapshot(memoryFileArray[0]);
    let after: { [key: string]: Array<HeapNode> } = parseMemorySnapshot(memoryFileArray[memoryFileArray.length - 1]);

    if (!before || !after) {
      logger.info(`memory parse : before : ${!!before}, after : ${!!after}`);
      return;
    }

    result.push(await this.diffMemory(before, after));

    if (memoryFileArray.length <= 2) {
      return;
    }

    let next;
    let length = memoryFileArray.length - 1;
    for (let idx = 0; idx < length; idx++) {
      if (idx + 1 === length) {
        next = after;
      } else {
        next = parseMemorySnapshot(memoryFileArray[idx + 1]);
      }

      result.push(await this.diffMemory(before, next));
      before = next;
    }
  }

  private static async diffMemory(before: { [key: string]: Array<HeapNode> }, after: { [key: string]: Array<HeapNode> }) {
    let result: Array<MemoryDiffItem> = new Array();
    let arr1: Array<HeapNode>, arr2: Array<HeapNode>;
    let sum1: number, sum2: number;
    const keys = Object.keys(after);
    for (let key of keys) {
      arr1 = after[key];
      arr2 = before[key];
      sum1 = sum2 = 0;
      if (arr1.length === 1) {
        continue;
      }

      for (let node of arr1) {
        sum1 += node.retainedSize;
      }
      if (arr2) {
        if (arr1.length === arr2.length) {
          continue;
        }
        for (let node of arr2) {
          sum2 += node.retainedSize;
        }
        result.push({
          name: key,
          count: arr1.length,
          size: sum1,
          sizeChange: `${formatMemorySize(sum2)} -> ${formatMemorySize(sum1)}`,
          sizeChangeForGlip: `from ${formatMemorySize(sum2)} to **${formatMemorySize(sum1)}**`,
          countChange: `${arr2.length} -> ${arr1.length}`,
          countChangeForGlip: `from ${arr2.length} to **${arr1.length}**`,
        });
      } else {
        result.push({
          name: key,
          count: arr1.length,
          size: sum1,
          sizeChange: `0B -> ${formatMemorySize(sum1)}`,
          sizeChangeForGlip: `from 0 to **${formatMemorySize(sum1)}**`,
          countChange: `0 -> ${arr1.length}`,
          countChangeForGlip: `from 0 to **${arr1.length}**`,
        });
      }
    }

    result.sort((a, b) => { return a.count !== b.count ? b.count - a.count : b.size - a.size });

    return result;
  }

  private static async summary(scene: SceneDto): Promise<{
    currentSummary: SceneSummary,
    lastSummary: SceneSummary
  }> {
    let memoryDto: MemoryDto;
    let loadingTimes: Array<LoadingTimeSummaryDto>;
    if (scene) {
      memoryDto = await MemoryDto.findOne({ where: { sceneId: scene.id } });
      loadingTimes = await LoadingTimeSummaryDto.findAll({
        where: { sceneId: scene.id },
      });
    }

    if (!goalMap[scene.name]) {
      goalMap[scene.name] = {};
    }

    let startMemory: number, endMemory: number, k: number, b: number, metric: {
      [key: string]: {
        apiAvg: number,
        apiMax: number,
        apiMin: number,
        apiTop90: number,
        apiTop95: number,
        handleCount: number
      }
    } = {};

    if (memoryDto) {
      k = parseFloat('' + memoryDto.k);
      b = parseFloat('' + memoryDto.b);
      startMemory = parseFloat('' + memoryDto.startMemory);
      endMemory = parseFloat('' + memoryDto.endMemory);
    }

    let metricKeys = [];
    if (loadingTimes && loadingTimes.length > 0) {
      loadingTimes.forEach(time => {
        metricKeys.push(time.name);
        metric[time.name] = {
          apiAvg: parseFloat('' + time.apiAvgTime),
          apiMax: parseFloat('' + time.apiMaxTime),
          apiMin: parseFloat('' + time.apiMinTime),
          apiTop90: parseFloat('' + time.apiTop90Time),
          apiTop95: parseFloat('' + time.apiTop95Time),
          handleCount: parseFloat('' + time.apiHandleCount)
        }
      });
    }

    let releaseMetric: {
      [key: string]: {
        apiAvg: number,
        apiMax: number,
        apiMin: number,
        apiTop90: number,
        apiTop95: number,
        handleCount: number
      }
    } = {};

    const result: { currentSummary: SceneSummary, lastSummary: SceneSummary } = {
      currentSummary: { startMemory, endMemory, k, b, metric },
      lastSummary: { startMemory: undefined, endMemory: undefined, k: undefined, b: undefined, metric: releaseMetric }
    };

    const now = await VersionDto.findOne({ where: { name: scene.appVersion } });
    if (!now) {
      return result;
    }
    const pre = await VersionDto.findOne({ where: { id: { [Op.lt]: now.id }, isRelease: true }, order: [['id', 'desc']] });
    if (!pre) {
      return result;
    }

    const memorySummary = await MemorySummaryDto.findOne({ where: { versionId: pre.id, isRelease: true, platform: scene.platform } });
    if (memorySummary) {
      result.lastSummary.k = parseFloat('' + memorySummary.k);
      result.lastSummary.b = parseFloat('' + memorySummary.b);
      result.lastSummary.startMemory = parseFloat('' + memorySummary.startMemory);
      result.lastSummary.endMemory = parseFloat('' + memorySummary.endMemory);
    }
    if (metricKeys.length === 0) {
      return result;
    }

    const arr = await LoadingTimeReleaseSummaryDto.findAll({ where: { platform: scene.platform, version: pre.name, name: { [Op.in]: metricKeys } } });
    if (arr && arr.length > 0) {
      arr.forEach(time => {
        releaseMetric[time.name] = {
          apiAvg: parseFloat('' + time.apiAvgTime),
          apiMax: parseFloat('' + time.apiMaxTime),
          apiMin: parseFloat('' + time.apiMinTime),
          apiTop90: parseFloat('' + time.apiTop90Time),
          apiTop95: parseFloat('' + time.apiTop95Time),
          handleCount: time.apiHandleCount
        }
      });
    }

    await DashboardService.setGoal(scene.name, scene.platform, metricKeys, now.id);

    return result;
  }

  static async setGoal(sceneName: string, platform: string, metricKeys: Array<string>, versionId: number): Promise<void> {
    if (!goalMap[sceneName]) {
      goalMap[sceneName] = {};
    }

    const array = await VersionDto.findAll({ where: { id: { [Op.lt]: versionId }, isRelease: true }, order: [['id', 'desc']] });
    if (!array) {
      return;
    }

    const versionIds = array.map(v => v.id);

    const arr = await LoadingTimeReleaseSummaryDto.findAll({ where: { platform: platform, versionId: { [Op.in]: versionIds }, name: { [Op.in]: metricKeys } } });
    const map: { [key: string]: Array<LoadingTimeReleaseSummaryDto> } = {};
    for (let key of metricKeys) {
      map[key] = [];
    }

    for (let dto of arr) {
      map[dto.name].push(dto);
    }

    let dtos: Array<LoadingTimeReleaseSummaryDto>, sum;
    for (let key of metricKeys) {
      dtos = map[key];
      if (dtos.length === 0) {
        if (_config.scenes[sceneName] && _config.scenes[sceneName].metric[key]) {
          goalMap[sceneName][key] = _config.scenes[sceneName].metric[key].apiGoal;
        }
        continue;
      }

      sum = dtos.map(v => parseFloat('' + v.apiAvgTime)).reduce((a, b) => a + b, 0);
      goalMap[sceneName][key] = sum / dtos.length;
      goalMap[sceneName][key] = goalMap[sceneName][key] > maxGoalValue ? maxGoalValue : goalMap[sceneName][key];
    }
  }

  static async getVersionInfo(host?: string): Promise<DashboardVersionInfo> {
    if (!host) {
      host = Config.jupiterHost;
    }

    if (_versionInfo[host]) {
      return _versionInfo[host];
    }

    const info = new DashboardVersionInfo();
    const browser = await PptrUtils.launch();
    const page = await browser.newPage();

    await page.goto(host);

    let cnt = 2;
    let jupiterVersion;
    const jupiterVersionSelector = "#root > div:nth-child(2) > div > div:nth-child(1)";
    while (cnt-- > 0) {
      jupiterVersion = await PptrUtils.text(page, jupiterVersionSelector);
    }

    if (!jupiterVersion || typeof jupiterVersion === 'boolean') {
      jupiterVersion = "unknown";
    } else if (jupiterVersion.startsWith("Version: ")) {
      jupiterVersion = jupiterVersion.substring("Version: ".length).trim();
    }

    const appVersion = await page.evaluate(() => {
      let arr = navigator.appVersion.split(' ');
      for (let item of arr) {
        if (item.startsWith("Chrome/")) {
          return item;
        }
      }
      return "unknown";
    });

    const osType = os.type();
    try {
      if (osType.toLocaleLowerCase() === 'darwin') {
        let versionInfo = plist.parse(fs.readFileSync("/System/Library/CoreServices/SystemVersion.plist", "utf-8"));
        info.osInfo = `${versionInfo.ProductName}-${versionInfo.ProductVersion}`.replace(/\s/g, '-').replace(/\./g, '_');
      }
    } finally {
      if (!info.osInfo) {
        info.osInfo = `${osType}-${os.release()}`.replace(/\s/g, '-').replace(/\./g, '_');
      }
    }

    info.platform = "Web";
    info.jupiterVersion = jupiterVersion;
    info.appVersion = appVersion.replace('/', '-');
    await PptrUtils.close(browser);

    _versionInfo[host] = info;

    logger.info(`${host} => ${JSON.stringify(info)}`);

    return info;
  }

  static getIframeUrl(questionId: number, params: {}): string {
    const METABASE_SITE_URL = "http://xmn145.rcoffice.ringcentral.com:9005";
    // const METABASE_SECRET_KEY = "4d71fd0fa0a60ad776914b4fe39326cbbb96a4761e440364e8a95d90a9a40502";
    // const payload = {
    //   resource: { question: questionId },
    //   params
    // };

    // const token = jwt.sign(payload, METABASE_SECRET_KEY);
    // return [METABASE_SITE_URL, '/embed/question/', token, '#bordered=true&titled=true'].join('');
    const search = new URLSearchParams(params);
    return [METABASE_SITE_URL, '/question/', questionId, '?', search.toString()].join('');
  }

  static async buildReport() {
    let glipMessage = [], merticWarnArr = [], merticBlockArr = [], memoryDiff = [];
    let htmlArray = ['<!doctype html><html><head><title>Performance Dashboard</title><style>'];
    htmlArray.push('*{margin:0;padding:0;border:0}');
    htmlArray.push('body{margin-bottom:30px}');
    htmlArray.push('.dashboard-item{margin:40px auto 0;width:700px;border:1px solid #ddd;border-radius: 10px;padding: 15px 40px;box-shadow:5px 0 5px #e3e3e3}');
    htmlArray.push('.dashboard-item-title{text-align:center;font-weight:bold;font-size:20px;}');
    htmlArray.push('.dashboard-item-info{margin:5px 0px 10px;}');
    htmlArray.push('.dashboard-item-info > span{font-weight:bold;}');
    htmlArray.push('.dashboard-item-memory{margin:5px 0px 10px;}');
    htmlArray.push('.dashboard-item-point{margin:5px 0px 15px;}');
    htmlArray.push('.dashboard-item-point-title{font-weight:bold;font-size:18px;margin-bottom:10px;}');
    htmlArray.push('.dashboard-item-point-code{border:1px solid #999;border-radius: 10px;margin-bottom:20px;padding: 10px;overflow-x: auto;}');
    htmlArray.push('.dashboard-item-point-title a {margin-left:20px;text-decoration:none;color:#509ee3;padding: 2px 5px;border-radius: 5px;font-size: 14px;border: 1px solid #eee;}');
    htmlArray.push('.dashboard-item-point-metric{margin-bottom:10px}');
    htmlArray.push('.dashboard-item-point-number{margin-bottom:10px}');
    htmlArray.push('.dashboard-item-point-number > span{font-weight:bold;}');
    htmlArray.push('.dashboard-item-memory-diff {border-top:1px solid #eee;border-left:1px solid #eee;}')
    htmlArray.push('.dashboard-item-memory-diff td, .dashboard-item-memory-diff th {padding:2px 10px;text-align:left;min-width:100px;border-bottom:1px solid #eee;border-right:1px solid #eee}');
    htmlArray.push('</style></head><body>');

    const versionInfo: DashboardVersionInfo = await DashboardService.getVersionInfo();
    const envInfo = `Jupiter ${versionInfo.platform} / ${versionInfo.jupiterVersion} / ${versionInfo.appVersion} ${versionInfo.osInfo}`;

    glipMessage.push(`**Site:**  ${Config.jupiterHost}`);
    glipMessage.push(`**Env:**  ${envInfo}`);
    glipMessage.push('\n**Results:**');
    const mayMemoryLeak = [];
    const longTaskMessages = [];

    Object.keys(items).forEach(key => {
      const item = items[key];
      const metric = item.metric;
      htmlArray.push(
        '<div class="dashboard-item">',
        '<div class="dashboard-item-title">', key, '</div>',
      );

      htmlArray.push('<div class="dashboard-item-info">Env : <span>', envInfo, '</span></div>');
      htmlArray.push('<div class="dashboard-item-info">', 'Number of executions : <span>', Config.sceneRepeatCount.toFixed(0), '</span></div>');
      let longTaskCount = 0;
      for (let longTask of item.longTasks) {
        if (longTask.duration >= Config.functionTimeout) {
          longTaskCount++;
        }
      }
      if (longTaskCount > 0) {
        htmlArray.push('<div class="dashboard-item-info">', 'There have <span style="color:red">', longTaskCount.toFixed(), '</span> long task(s) during this scenario', '</div>');
        longTaskMessages.push(['There have **', longTaskCount.toFixed(), '** long task(s) during **', key, '**'].join(''));
      }

      if (item.startMemory && item.memoryGrowth) {
        const memoryUrl = DashboardService.getIframeUrl(252, { name: key });
        htmlArray.push('<div class="dashboard-item-memory">',
          '<div><a href="', memoryUrl, '" target="_blank">Memory Trend</a></div>',
          'Start memory usage:', item.startMemory.formatMemoryForHtml(),
          'JS memory growth:', item.memoryGrowth.formatMemoryForHtml(),
          '</div>');
        const resultOfStart = item.startMemory.formatMemoryForGlip();
        const resultOfEnd = item.memoryGrowth.formatMemoryForGlip();
        let icon;
        if (resultOfStart.level === 'warn' || resultOfEnd.level === 'warn') {
          icon = _config.icons.warning;
        }
        if (resultOfStart.level === 'block' || resultOfEnd.level === 'block') {
          icon = _config.icons.block;
        }

        if (icon) {
          mayMemoryLeak.push(`${icon}[**${key}**](${memoryUrl})`);
        }
      }

      if (item.k && item.b) {
        htmlArray.push('<div class="dashboard-item-memory">', '[Memory]Linear regression:', item.k.formatLinearRegressionForHtml(item.b), '</div>');
      }

      htmlArray.push('<div class="dashboard-item-points">');

      Object.keys(metric).forEach(k => {
        const m = metric[k];
        const goal = goalMap[key][k];
        // const url = _config.scenes[key].metric[k].url;
        const devIframe = DashboardService.getIframeUrl(157, { name: k });
        const relIframe = DashboardService.getIframeUrl(156, { name: k });
        htmlArray.push(
          '<div class="dashboard-item-point">',
          '<div class="dashboard-item-point-title">', k,
          '<a href="', devIframe, '" target="_blank">Develop Trend</a>',
          '<a href="', relIframe, '" target="_blank">Release Trend</a>',
          '<a href="', _config.lodingTimeUrl, '?sceneId=', item.sceneId.toString(), '" target="_blank">Detail</a></div>');

        if (m.handleCount >= 0) {
          htmlArray.push(
            '<div class="dashboard-item-point-number">',
            'Data size : <span>', m.handleCount.toFixed(0),
            '</span></div>');
        }

        htmlArray.push(
          '<div class="dashboard-item-point-metric">',
          'apiAvg:', m.apiAvg.formatHtml(goal),
          'apiMax:', m.apiMax.formatHtml(goal),
          'apiMin:', m.apiMin.formatHtml(goal),
          '</div><div class="dashboard-item-point-metric">',
          'apiTop95:', m.apiTop95.formatHtml(goal),
          'apiTop90:', m.apiTop90.formatHtml(goal),
          '</div></div>'
        );

        const avgMertic = m['apiAvg'].formatGlip(k, m.handleCount, devIframe, goal);
        if (avgMertic.level === 'warn') {
          merticWarnArr.push(avgMertic.text);
        } else if (avgMertic.level === 'block') {
          merticBlockArr.push(avgMertic.text);
        }
      });
      if (item.memoryDiffArray.length > 0) {
        let max = 5;
        memoryDiff.push(`In **${key}**`);
        item.memoryDiffArray[0].forEach(diff => {
          if (max-- > 0) {
            memoryDiff.push(`For class **${diff.name}**, number of instance increase ${diff.countChangeForGlip} and total memory usage increase ${diff.sizeChangeForGlip}`);
          }
        });
        let start = item.memoryDiffArray.length > 1 ? 1 : 0;

        htmlArray.push('</div>');
        let flag = 1;
        for (let idx = start; idx < item.memoryDiffArray.length; idx++) {
          htmlArray.push('<br/><div>', 'from ', flag.toFixed(0), ' heap snapshot to ', (flag + 1).toFixed(0), ' heap snapshot', '</div>')
          htmlArray.push('<table class="dashboard-item-memory-diff"><tr><th>className</th><th>count</th><th>size</th></tr>');
          item.memoryDiffArray[idx].forEach(diff => {
            htmlArray.push('<tr><td>', diff.name, '</td>', '<td>', diff.countChange, '</td>', '<td>', diff.sizeChange, '</td></tr>');
          });
          htmlArray.push('</table>');
          flag++;
        }

        htmlArray.push('</div>');
      } else {
        htmlArray.push('</div></div>');
      }

    });

    if (merticWarnArr.length === 0 && merticBlockArr.length === 0) {
      glipMessage.push('All of metric seem to be good. See all metrics from below link');
    } else {
      glipMessage.push(...merticBlockArr);
      glipMessage.push(...merticWarnArr);
    }

    if (mayMemoryLeak.length > 0) {
      glipMessage.push('\n**Please pay attention about memory, following: **', ...mayMemoryLeak);
    }
    if (longTaskMessages.length > 0) {
      glipMessage.push('\n**Please pay attention about long tasks, following: **', ...longTaskMessages);
    }

    //FIXME
    /*
        let dir = path.join(process.cwd(), Config.reportUri)
        let files = fs.readdirSync(dir, 'utf8');
        for (let file of files) {
          if (file.endsWith('.traces.json')) {
            await parseTracing(path.join(dir, file));
          }
        }
        let tracingSummary = await summariseTracing();

        if (tracingSummary.length > 0) {
          glipMessage.push(`\n**There have ${tracingSummary.length} function which time cost over ${Config.functionTimeout}ms.**`)

          htmlArray.push(
            '<div class="dashboard-item">',
            '<div class="dashboard-item-title">', 'Function call over ', Config.functionTimeout.toFixed(), 'ms</div>',
          );
          for (let item of tracingSummary) {
            htmlArray.push('<div class="dashboard-item-point-title">', item.filePath, '</div>');
            htmlArray.push('<pre class="dashboard-item-point-code">', item.code, '</pre>');
          }
        }
    */
    htmlArray.push('</body></html>');

    if (memoryDiff.length > 0) {
      glipMessage.push('\n**Memory Diff:**');
      glipMessage.push(...memoryDiff);
    }

    glipMessage.push(`\n**Metabase:** [Link](${Config.dashboardUrl})`);
    glipMessage.push(`**Lighthouse:** [Link](${Config.buildURL}Lighthouse)`);
    glipMessage.push(`**Performance related Jira Tickets:** [Link](${Config.jiraUrl})`);
    glipMessage.push(`**Dashboard(See all metrics from the link):** [Link](${Config.buildURL}Dashboard)`);

    FileService.saveDashboardIntoDisk(htmlArray.join(''));
    FileService.saveGlipMessageIntoDisk(glipMessage.join('\n'));
  }
}

export {
  DashboardService,
}
