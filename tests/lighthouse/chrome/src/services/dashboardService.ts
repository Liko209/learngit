/*
 * @Author: doyle.wu
 * @Date: 2019-04-10 16:59:39
 */
import * as fs from 'fs';
import * as path from 'path';
import { LogUtils } from '../utils';
import { FileService } from './fileService';
import { Op } from 'sequelize';
import { Config } from '../config';
import { HeapNode, parseMemorySnapshot } from '../analyse';
import { TaskDto, SceneDto, PerformanceItemDto, LoadingTimeSummaryDto } from '../models';

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
        "handle_incoming_data": {
          "name": "handle_incoming_data",
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
    }
  };
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
    this.current = parseFloat('' + current);
    this.last = parseFloat('' + last);
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

  formatGlip(title: string, goal?: number): string {
    let message = [title, ' : '];
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

    if (goal && this.current > goal) {
      icon = _config.icons.block;
    }

    message.push(icon, this.current.toFixed(2), this.unit, suffix);

    if (icon === _config.icons.block || suffix.startsWith('(+')) {
      return message.join('');
    } else {
      return undefined;
    }
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
      apiTop95: DashboardPair
    }
  };

  memory: DashboardPair;
  jsMemory: DashboardPair;

  memoryDiffArray: Array<MemoryDiffItem>;
}

class MemoryDiffItem {
  name: string;
  count: number;
  size: number;
  countChange: string;
  sizeChange: string;
}

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

class DashboardService {

  static async addItem(task: TaskDto, scene: SceneDto, artifacts: any) {
    const sceneConfig = _config.scenes[scene.name];
    if (!sceneConfig || Object.keys(sceneConfig.metric).length === 0) {
      return;
    }

    const tasks = await TaskDto.findAll({
      where: {
        status: '1',
        host: task.host
      }
    });

    const taskIds = [];
    let lastScene: SceneDto;
    if (tasks) {
      tasks.forEach(t => {
        taskIds.push(t.id);
      });

    }

    if (taskIds.length > 0) {
      lastScene = await SceneDto.findOne({
        where: { name: scene.name, platform: scene.platform, id: { [Op.not]: scene.id }, taskId: { [Op.in]: taskIds } },
        order: [['start_time', 'desc']],
      });
    }

    const currentSummary = await DashboardService.summary(scene);
    const lastSummary = await DashboardService.summary(lastScene);

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
        apiTop95: new DashboardPair(currentItem.apiTop95, lastItem['apiTop95'], 'ms')
      }
    });

    await DashboardService.memorySummary(item, artifacts);

    if (Object.keys(item.metric).length > 0) {
      item.memory = new DashboardPair(currentSummary.memory, lastSummary.memory, 'MB');
      item.jsMemory = new DashboardPair(currentSummary.jsMemory, lastSummary.jsMemory, 'MB');
      items[scene.name] = item;
    }
  }

  private static async memorySummary(item: DashboardItem, artifacts: any) {
    let result: Array<MemoryDiffItem> = new Array();
    item.memoryDiffArray = result;

    if (!artifacts) {
      return;
    }
    let gatherer = artifacts['MemoryGatherer'];
    if (!gatherer) {
      return;
    }
    let memoryFileArray = gatherer['memoryFileArray'];
    if (!memoryFileArray || memoryFileArray.length <= 1) {
      return;
    }
    let before: { [key: string]: Array<HeapNode> } = parseMemorySnapshot(memoryFileArray[0]);
    let after: { [key: string]: Array<HeapNode> } = parseMemorySnapshot(memoryFileArray[memoryFileArray.length - 1]);

    if (!before || !after) {
      return;
    }

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
          countChange: `${arr2.length} -> ${arr1.length}`
        });
      } else {
        result.push({
          name: key,
          count: arr1.length,
          size: sum1,
          sizeChange: `0 -> ${formatMemorySize(sum1)}`,
          countChange: `0 -> ${arr1.length}`
        });
      }
    }

    result.sort((a, b) => { return a.count !== b.count ? b.count - a.count : b.size - a.size });
  }

  private static async summary(scene: SceneDto): Promise<{
    memory: number,
    jsMemory: number,
    metric: {
      [key: string]: {
        apiAvg: number,
        apiMax: number,
        apiMin: number,
        apiTop90: number,
        apiTop95: number
      }
    }
  }> {
    let performanceItems: Array<PerformanceItemDto>;
    let loadingTimes: Array<LoadingTimeSummaryDto>;
    if (scene) {
      performanceItems = await PerformanceItemDto.findAll({
        where: { sceneId: scene.id },
        order: [['index']]
      });
      loadingTimes = await LoadingTimeSummaryDto.findAll({
        where: { sceneId: scene.id },
      });
    }

    let memory: number, jsMemory: number, metric: {
      [key: string]: {
        apiAvg: number,
        apiMax: number,
        apiMin: number,
        apiTop90: number,
        apiTop95: number
      }
    } = {};

    if (performanceItems && performanceItems.length > 0) {
      const item = performanceItems[performanceItems.length - 1];
      memory = parseFloat('' + item.privateMemory);
      jsMemory = parseFloat('' + item.jsMemoryUsed);
    }

    if (loadingTimes && loadingTimes.length > 0) {
      loadingTimes.forEach(time => {
        metric[time.name] = {
          apiAvg: time.apiAvgTime,
          apiMax: time.apiMaxTime,
          apiMin: time.apiMinTime,
          apiTop90: time.apiTop90Time,
          apiTop95: time.apiTop95Time
        }
      });
    }
    return { memory, jsMemory, metric }
  }

  static buildReport() {
    let glipMessage = [];
    let htmlArray = ['<!doctype html><html><head><title>Performance Dashboard</title><style>'];
    htmlArray.push('*{margin:0;padding:0;border:0}');
    htmlArray.push('body{margin-bottom:30px}');
    htmlArray.push('.dashboard-item{margin:40px auto 0;width:600px;border:1px solid #ddd;border-radius: 10px;padding: 15px 40px;box-shadow:5px 0 5px #e3e3e3}');
    htmlArray.push('.dashboard-item-title{text-align:center;font-weight:bold;font-size:20px;}');
    htmlArray.push('.dashboard-item-memory{margin:5px 0px 10px;}');
    htmlArray.push('.dashboard-item-point{margin:5px 0px 15px;}');
    htmlArray.push('.dashboard-item-point-title{font-weight:bold;font-size:18px;margin-bottom:10px;}');
    htmlArray.push('.dashboard-item-point-title a {margin-left:20px;text-decoration:none;color:#509ee3;padding: 2px 5px;border-radius: 5px;font-size: 14px;border: 1px solid #eee;}');
    htmlArray.push('.dashboard-item-point-metric{margin-bottom:10px}');
    htmlArray.push('.dashboard-item-memory-diff {border-top:1px solid #eee;border-left:1px solid #eee;}')
    htmlArray.push('.dashboard-item-memory-diff td, .dashboard-item-memory-diff th {padding:2px 10px;text-align:left;min-width:100px;border-bottom:1px solid #eee;border-right:1px solid #eee}');
    htmlArray.push('</style></head><body>');

    Object.keys(items).forEach(key => {
      const item = items[key];
      const metric = item.metric;
      htmlArray.push(
        '<div class="dashboard-item">',
        '<div class="dashboard-item-title">', key, '</div>',
        '<div class="dashboard-item-memory">', 'Last memory usage:', item.memory.formatHtml(), 'Last js memory usage:', item.jsMemory.formatHtml(), '</div>',
        '<div class="dashboard-item-points">',
      );

      Object.keys(metric).forEach(k => {
        const m = metric[k];
        const goal = _config.scenes[key].metric[k].apiGoal;
        const url = _config.scenes[key].metric[k].url;
        htmlArray.push(
          '<div class="dashboard-item-point">',
          '<div class="dashboard-item-point-title">', k,
          '<a href="', url, '?sceneId=', item.sceneId.toString(), '" target="_blank">Trend</a>',
          '<a href="', _config.lodingTimeUrl, '?sceneId=', item.sceneId.toString(), '" target="_blank">Detail</a></div>',
          '<div class="dashboard-item-point-metric">',
          'apiAvg:', m.apiAvg.formatHtml(goal),
          'apiMax:', m.apiMax.formatHtml(goal),
          'apiMin:', m.apiMin.formatHtml(goal),
          '</div><div class="dashboard-item-point-metric">',
          'apiTop95:', m.apiTop95.formatHtml(goal),
          'apiTop90:', m.apiTop90.formatHtml(goal),
          '</div></div>'
        );

        const merticArr = [];
        ['apiAvg', 'apiTop90', 'apiTop95'].forEach(a => {
          const res = m[a].formatGlip(a, goal);
          if (res) {
            merticArr.push(res);
          }
        });
        if (merticArr.length > 0) {
          glipMessage.push(`**${k}**`, merticArr.join('    '), '')
        }
      });
      if (item.memoryDiffArray.length > 0) {
        htmlArray.push('</div><table class="dashboard-item-memory-diff"><tr><th>className</th><th>count</th><th>size</th></tr>');
        glipMessage.push(`**Memory Diff for ${key}**`);
        let max = 5;
        item.memoryDiffArray.forEach(diff => {
          htmlArray.push('<tr><td>', diff.name, '</td>', '<td>', diff.countChange, '</td>', '<td>', diff.sizeChange, '</td></tr>');
          if (max-- > 0) {
            glipMessage.push(`${diff.name} (count: ${diff.countChange}, size: ${diff.sizeChange})`);
          }
        });
        htmlArray.push('</table></div>');
      } else {
        htmlArray.push('</div></div>');
      }

    });
    htmlArray.push('</body></html>');

    glipMessage.push(`**Dashboard** :\n ${Config.buildURL}Dashboard`);
    glipMessage.push(`**Lighthouse** :\n ${Config.buildURL}Lighthouse`);
    glipMessage.push(`**Metabase** :\n ${Config.dashboardUrl}`);

    FileService.saveDashboardIntoDisk(htmlArray.join(''));
    FileService.saveGlipMessageIntoDisk(glipMessage.join('\n'));
  }
}

export {
  DashboardService,
}
