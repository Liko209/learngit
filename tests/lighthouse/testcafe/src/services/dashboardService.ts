/*
 * @Author: doyle.wu
 * @Date: 2019-04-10 16:59:39
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogUtils } from '../utils';
import { FileService } from './fileService';
import { Globals, Config } from '..';
import { Op } from 'sequelize';
import {
  SceneDto,
  LoadingTimeSummaryDto,
  VersionDto, LoadingTimeReleaseSummaryDto
} from '../dtos';
import { URLSearchParams } from 'url';

class DashboardMetricItemConfig {
  name: string;
  url: string;
  apiGoal: number;
}

class DashboardSceneConfig {
  name: string;
  gatherer: string;
  memoryUrl: string;
  cpuUrl: string;
  metric: { [key: string]: DashboardMetricItemConfig };
}

class FlagConfig {
  warning: string;
  block: string;
  pass: string;
}

class DashboardConfig {
  colors: FlagConfig = {
    warning: "#f9d45c",
    block: "#ef8c8c",
    pass: "#9cc177"
  };
  icons: FlagConfig = {
    "warning": ":warning:",
    "block": ":negative_squared_cross_mark:",
    "pass": ":white_check_mark:"
  };
  lodingTimeUrl: string = "http://xmn145.rcoffice.ringcentral.com:9005/question/140";
  scenes: { [key: string]: DashboardSceneConfig } = {
    "SwitchConversationScene": {
      "name": "SwitchConversationScene",
      "gatherer": "SwitchConversationGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/57",
      "cpuUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/58",
      "metric": {
        "goto_conversation_fetch_items": {
          "name": "goto_conversation_fetch_items",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/50",
          "apiGoal": 1000
        },
        "goto_conversation_fetch_posts": {
          "name": "goto_conversation_fetch_posts",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/101",
          "apiGoal": 1000
        },
        "conversation_fetch_from_db": {
          "name": "conversation_fetch_from_db",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/102",
          "apiGoal": 1000
        }
      }
    },
    "SearchScene": {
      "name": "SearchScene",
      "gatherer": "SearchGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/125",
      "cpuUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/128",
      "metric": {
        "search_group": {
          "name": "search_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/51",
          "apiGoal": Number.MAX_VALUE
        },
        "search_people": {
          "name": "search_people",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/52",
          "apiGoal": Number.MAX_VALUE
        },
        "search_team": {
          "name": "search_team",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/53",
          "apiGoal": Number.MAX_VALUE
        }
      }
    },
    "FetchGroupScene": {
      "name": "FetchGroupScene",
      "gatherer": "FetchGroupGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/126",
      "cpuUrl": "http://xmn145.rcoffice.ringcentral.com:9005/question/127",
      "metric": {
        "group_section_fetch_teams": {
          "name": "group_section_fetch_teams",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/54",
          "apiGoal": Number.MAX_VALUE
        },
        "group_section_fetch_favorites": {
          "name": "group_section_fetch_favorites",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/55",
          "apiGoal": Number.MAX_VALUE
        },
        "group_section_fetch_direct_messages": {
          "name": "group_section_fetch_direct_messages",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/56",
          "apiGoal": Number.MAX_VALUE
        }
      }
    },
    "IndexDataScene": {
      "name": "IndexDataScene",
      "gatherer": "IndexDataGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "cpuUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "metric": {
        "handle_incoming_account": {
          "name": "handle_incoming_account",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/141",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_company": {
          "name": "handle_incoming_company",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/142",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_item": {
          "name": "handle_incoming_item",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/143",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_presence": {
          "name": "handle_incoming_presence",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/144",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_state": {
          "name": "handle_incoming_state",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/145",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_profile": {
          "name": "handle_incoming_profile",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/146",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_person": {
          "name": "handle_incoming_person",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/147",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_group": {
          "name": "handle_incoming_group",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/148",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_incoming_post": {
          "name": "handle_incoming_post",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/149",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_index_data": {
          "name": "handle_index_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/150",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_remaining_data": {
          "name": "handle_remaining_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/151",
          "apiGoal": Number.MAX_VALUE
        },
        "handle_initial_data": {
          "name": "handle_initial_data",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/152",
          "apiGoal": Number.MAX_VALUE
        }
      }
    },
    "SearchPhoneScene": {
      "name": "SearchPhoneScene",
      "gatherer": "SearchPhoneGatherer",
      "memoryUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "cpuUrl": "http://xmn145.rcoffice.ringcentral.com:9005",
      "metric": {
        "search_phone_number": {
          "name": "search_phone_number",
          "url": "http://xmn145.rcoffice.ringcentral.com:9005/question/180",
          "apiGoal": Number.MAX_VALUE
        }
      }
    },
  };
}

class SceneSummary {
  metric: {
    [key: string]: {
      apiAvg: number,
      apiMax: number,
      apiMin: number,
      apiTop90: number,
      apiTop95: number,
      handleCount: number
    }
  }
}

const logger = LogUtils.getLogger(__filename);

const _config = new DashboardConfig();

const configPath = path.join(process.cwd(), 'benchmark.json');
if (fs.existsSync(configPath)) {
  let json;

  try {
    json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    logger.warn('load [benchmark.json] failed')
  }

  if (json) {
    const { colors, icons, scenes, lodingTimeUrl } = json;
    if (colors) {
      _config.colors = Object.assign(_config.colors, colors);
    }

    if (icons) {
      _config.icons = Object.assign(_config.icons, icons);
    }

    if (lodingTimeUrl) {
      _config.lodingTimeUrl = lodingTimeUrl;
    }

    if (scenes && scenes instanceof Array) {
      _config.scenes = {};
      for (let scene of scenes) {
        const { name, gatherer, memoryUrl, cpuUrl, metric } = scene;
        if (name && gatherer && memoryUrl && cpuUrl && metric && metric instanceof Array) {
          const map: { [key: string]: DashboardMetricItemConfig } = {};
          for (let item of metric) {
            const { url, apiGoal } = item;
            const metricName = item['name'];
            if (url && metricName && apiGoal && typeof apiGoal === 'number') {
              map[metricName] = {
                url, apiGoal, name: metricName
              }
            }
          }

          if (Object.keys(map).length === 0) {
            continue;
          }
          _config.scenes[name] = {
            name, gatherer, memoryUrl, cpuUrl, metric: map
          }
        }
      }
    }
  }
}

class DashboardPair {
  current: number;
  last: number;
  unit: string;

  constructor(current: number, last: number, unit: string) {
    this.current = current;
    this.last = last;
    this.unit = unit;
  }

  formatHtml(goal?: number): string {
    let color = _config.colors.pass;
    let text = [this.current.toFixed(2), this.unit];

    if (this.last) {
      const offset = this.current - this.last;
      if (offset > 0) {
        color = _config.colors.warning;
        text.push('(+', offset.toFixed(2), ')');
      } else if (offset < 0) {
        text.push('(', offset.toFixed(2), ')');
      }
    }

    if (goal && this.current > goal) {
      color = _config.colors.block;
    }
    return `<span style="color:${color};margin-left:10px;margin-right:40px;">${text.join('')}</span>`
  }

  formatGlip(key: string, handleCount: number, link: string, goal?: number): { level: string, text: string } {
    let icon = _config.icons.pass, suffix = '';
    if (this.last) {
      const offset = this.current - this.last;
      if (offset > 0) {
        icon = _config.icons.warning;
        suffix = `(+${offset.toFixed(2)})`;
      } else {
        suffix = `(${offset.toFixed(2)})`;
      }
    }

    let level = 'pass';
    if (suffix.startsWith('(+')) {
      level = 'warn';
    }

    if (goal && this.current > goal) {
      icon = _config.icons.block;
      level = 'block';
    }

    let text = [icon, 'do [**', key, '**](', link, ') ', Config.sceneRepeatCount, ' times, average consuming time: **',
      this.current.toFixed(2), '** ', this.unit];
    if (handleCount >= 0) {
      text.push(', number of data: **', handleCount, '**');
    }

    return {
      level,
      text: text.join('')
    };
  }
}

class DashboardItem {
  sceneId: number;
  metric: {
    [key: string]: {
      apiAvg: DashboardPair,
      apiMax: DashboardPair,
      apiMin: DashboardPair,
      apiTop90: DashboardPair,
      apiTop95: DashboardPair,
      handleCount: number
    }
  };
}

let items: { [key: string]: DashboardItem } = {};

class DashboardService {

  static async clear() {
    items = {};
  }

  static async addItem(scene: SceneDto) {
    const sceneConfig = _config.scenes[scene.name];
    if (!sceneConfig || Object.keys(sceneConfig.metric).length === 0) {
      return;
    }

    const { currentSummary, lastSummary } = await DashboardService.summary(scene);

    const metric = sceneConfig.metric;

    const item: DashboardItem = new DashboardItem();
    item.metric = {};
    item.sceneId = scene.id;

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

    if (Object.keys(item.metric).length > 0) {
      items[scene.name] = item;
    }
  }

  private static async summary(scene: SceneDto): Promise<{
    currentSummary: SceneSummary,
    lastSummary: SceneSummary
  }> {
    let loadingTimes: Array<LoadingTimeSummaryDto>;
    if (scene) {
      loadingTimes = await LoadingTimeSummaryDto.findAll({
        where: { sceneId: scene.id },
      });
    }

    let metric: {
      [key: string]: {
        apiAvg: number,
        apiMax: number,
        apiMin: number,
        apiTop90: number,
        apiTop95: number,
        handleCount: number
      }
    } = {};

    let metricKey = [];
    if (loadingTimes && loadingTimes.length > 0) {
      loadingTimes.forEach(time => {
        metricKey.push(time.name);
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

    const result = {
      currentSummary: { metric },
      lastSummary: { metric: releaseMetric }
    };

    if (metricKey.length === 0) {
      return result;
    }

    const now = await VersionDto.findOne({ where: { name: scene.appVersion } });
    if (!now) {
      return result;
    }
    const pre = await VersionDto.findOne({ where: { id: { [Op.lt]: now.id }, isRelease: true }, order: [['id', 'desc']] });
    if (!pre) {
      return result;
    }

    const arr = await LoadingTimeReleaseSummaryDto.findAll({ where: { platform: scene.platform, version: pre.name, name: { [Op.in]: metricKey } } });
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

    return result;
  }

  static getIframeUrl(questionId: number, params: {}): string {
    const METABASE_SITE_URL = "http://xmn145.rcoffice.ringcentral.com:9005";
    const search = new URLSearchParams(params);
    return [METABASE_SITE_URL, '/question/', questionId, '?', search.toString()].join('');
  }

  static async buildReport() {
    if (Globals.skipTest) {
      return;
    }
    let glipMessage = [], merticWarnArr = [], merticBlockArr = [];
    let htmlArray = ['<!doctype html><html><head><title>Performance Dashboard</title><style>'];
    htmlArray.push('*{margin:0;padding:0;border:0}');
    htmlArray.push('body{margin-bottom:30px}');
    htmlArray.push('.dashboard-item{margin:40px auto 0;width:700px;border:1px solid #ddd;border-radius: 10px;padding: 15px 40px;box-shadow:5px 0 5px #e3e3e3}');
    htmlArray.push('.dashboard-item-title{text-align:center;font-weight:bold;font-size:20px;}');
    htmlArray.push('.dashboard-item-info{margin:5px 0px 10px;}');
    htmlArray.push('.dashboard-item-info > span{font-weight:bold;}');
    htmlArray.push('.dashboard-item-point{margin:5px 0px 15px;}');
    htmlArray.push('.dashboard-item-point-title{font-weight:bold;font-size:18px;margin-bottom:10px;}');
    htmlArray.push('.dashboard-item-point-title a {margin-left:20px;text-decoration:none;color:#509ee3;padding: 2px 5px;border-radius: 5px;font-size: 14px;border: 1px solid #eee;}');
    htmlArray.push('.dashboard-item-point-metric{margin-bottom:10px}');
    htmlArray.push('.dashboard-item-point-number{margin-bottom:10px}');
    htmlArray.push('.dashboard-item-point-number > span{font-weight:bold;}');
    htmlArray.push('</style></head><body>');

    const versionInfo = await Globals.versions[Config.jupiterHost];
    const envInfo = `Jupiter ${versionInfo.platform} / ${versionInfo.jupiterVersion} / ${versionInfo.appVersion} ${versionInfo.osInfo}`;

    glipMessage.push(`**Site:**  ${Config.jupiterHost}`);
    glipMessage.push(`**Env:**  ${envInfo}`);
    glipMessage.push('\n**Results:**');

    Object.keys(items).forEach(key => {
      const item = items[key];
      const metric = item.metric;
      htmlArray.push(
        '<div class="dashboard-item">',
        '<div class="dashboard-item-title">', key, '</div>',
      );

      htmlArray.push('<div class="dashboard-item-info">Env : <span>', envInfo, '</span></div>');
      htmlArray.push('<div class="dashboard-item-info">', 'Number of executions : <span>', Config.sceneRepeatCount.toFixed(0), '</span></div>');

      htmlArray.push('<div class="dashboard-item-points">');

      Object.keys(metric).forEach(k => {
        const m = metric[k];
        const goal = _config.scenes[key].metric[k].apiGoal;
        // const url = _config.scenes[key].metric[k].url;
        const devIframe = DashboardService.getIframeUrl(157, { name: k, platform: versionInfo.browser });
        const relIframe = DashboardService.getIframeUrl(156, { name: k, platform: versionInfo.browser });
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

      htmlArray.push('</div></div>');
    });
    htmlArray.push('</body></html>');
    if (merticWarnArr.length === 0 && merticBlockArr.length === 0) {
      glipMessage.push('All of metric seem to be good');
    } else {
      glipMessage.push(...merticBlockArr);
      glipMessage.push(...merticWarnArr);
    }

    glipMessage.push(`\n**Dashboard:**\n${Config.buildURL}Electron\n`);
    glipMessage.push(`${Config.buildURL}Firefox`);

    FileService.saveDashboardIntoDisk(htmlArray.join(''), Globals.browserName);
    FileService.saveGlipMessageIntoDisk(glipMessage.join('\n'), Globals.browserName);
  }
}

export {
  DashboardService,
}
