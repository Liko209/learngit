/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:00:41
 */
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Scene } from "../scenes";
import { Config } from '../config';
import { PerformanceMetric } from "../gatherers";
import { DateUtils } from "../utils";
import {
  TaskDto,
  SceneDto,
  PerformanceDto,
  PerformanceItemDto,
  LoadingTimeSummaryDto,
  LoadingTimeItemDto,
  FpsDto,
  VersionDto,
  LoadingTimeDevelopSummaryDto,
  LoadingTimeReleaseSummaryDto,
  MemoryDto,
  MemorySummaryDto
} from "../models";
import { DashboardService } from '.';

class MetricService {

  static async createVersion(version: string): Promise<VersionDto> {
    const isRelease = Config.jupiterHost === Config.jupiterReleaseHost;
    let now = await VersionDto.findOne({ where: { name: version } });
    if (now) {
      if (!now.isRelease && isRelease) {
        await VersionDto.update({ isRelease: isRelease, endTime: new Date() },
          { where: { id: now.id } }
        );
        now.isRelease = isRelease;
      }
      return now;
    }

    let last = await VersionDto.findOne({ order: [['id', 'DESC']] });

    if (last && !last.endTime) {
      await VersionDto.update({ endTime: new Date() },
        { where: { id: last.id } }
      );
    }

    return await VersionDto.create({
      name: version,
      isRelease: isRelease,
      startTime: new Date()
    });
  }

  static async createTask(version: string): Promise<TaskDto> {
    return await TaskDto.create({
      host: Config.jupiterHost,
      status: "0",
      appVersion: version,
      isRelease: Config.jupiterHost === Config.jupiterReleaseHost,
      startTime: new Date()
    });
  }

  static async updateTaskForEnd(taskDto: TaskDto, status: string) {
    await TaskDto.update(
      {
        status: status,
        endTime: new Date()
      },
      { where: { id: taskDto.id } }
    );
  }

  static async createScene(taskDto: TaskDto, scene: Scene): Promise<SceneDto> {
    let platform = 'chrome';
    let data = scene.getData();
    let timing = scene.getTiming();
    let { uri, aliasUri, categories } = data;
    let { startTime, endTime } = timing;
    let performance, accessibility, bestPractices, seo, pwa;
    let taskId = taskDto.id,
      name = scene.name();
    let appVersion = scene.getAppVersion();

    performance = accessibility = bestPractices = seo = pwa = 0;
    if (categories["performance"] && categories["performance"].score) {
      performance = categories["performance"].score * 100;
    }

    if (categories["pwa"] && categories["pwa"].score) {
      pwa = categories["pwa"].score * 100;
    }

    if (categories["accessibility"] && categories["accessibility"].score) {
      accessibility = categories["accessibility"].score * 100;
    }

    if (categories["best-practices"] && categories["best-practices"].score) {
      bestPractices = categories["best-practices"].score * 100;
    }

    if (categories["seo"] && categories["seo"].score) {
      seo = categories["seo"].score * 100;
    }
    return await SceneDto.create({
      taskId,
      name,
      uri,
      aliasUri,
      platform,
      performance,
      accessibility,
      bestPractices,
      seo,
      pwa,
      startTime,
      endTime,
      appVersion,
      isRelease: Config.jupiterHost === Config.jupiterReleaseHost,
    });
  }

  static async createPerformance(sceneDto: SceneDto, scene: Scene) {
    let sceneId = sceneDto.id;
    let data = scene.getData();
    let { audits } = data;
    let firstContentfulPaint,
      firstMeaningfulPaint,
      speedIndex,
      firstCpuIdle,
      timeToInteractive,
      estimatedInputLatency;

    firstContentfulPaint = firstMeaningfulPaint = speedIndex = 0;
    firstCpuIdle = timeToInteractive = estimatedInputLatency = 0;
    if (
      audits["first-contentful-paint"] &&
      audits["first-contentful-paint"].rawValue
    ) {
      firstContentfulPaint = audits["first-contentful-paint"].rawValue;
    }

    if (
      audits["first-meaningful-paint"] &&
      audits["first-meaningful-paint"].rawValue
    ) {
      firstMeaningfulPaint = audits["first-meaningful-paint"].rawValue;
    }

    if (audits["speed-index"] && audits["speed-index"].rawValue) {
      speedIndex = audits["speed-index"].rawValue;
    }

    if (audits["first-cpu-idle"] && audits["first-cpu-idle"].rawValue) {
      firstCpuIdle = audits["first-cpu-idle"].rawValue;
    }

    if (audits["interactive"] && audits["interactive"].rawValue) {
      timeToInteractive = audits["interactive"].rawValue;
    }

    if (
      audits["estimated-input-latency"] &&
      audits["estimated-input-latency"].rawValue
    ) {
      estimatedInputLatency = audits["estimated-input-latency"].rawValue;
    }

    await PerformanceDto.create({
      sceneId,
      firstContentfulPaint,
      firstMeaningfulPaint,
      speedIndex,
      firstCpuIdle,
      timeToInteractive,
      estimatedInputLatency
    });
  }

  static async createPerformanceItem(sceneDto: SceneDto, scene: Scene) {
    let dtoArr = new Array();
    let sceneId = sceneDto.id;
    let artifacts = scene.getArtifacts();
    let { ProcessGatherer, ProcessGatherer2 } = artifacts;
    let metrics: Array<PerformanceMetric>;
    if (ProcessGatherer) {
      metrics = ProcessGatherer.metrics;
    } else if (ProcessGatherer2) {
      metrics = ProcessGatherer2.metrics;
    }

    if (!metrics || metrics.length == 0) {
      return;
    }

    let index = 1;
    for (let item of metrics) {
      dtoArr.push({
        sceneId: sceneId,
        index: index++,
        url: item.url,
        cpu: item.cpu,
        privateMemory: item.privateMemory / 1024 / 1024,
        jsMemoryAllocated: item.jsMemoryAllocated / 1024 / 1024,
        jsMemoryUsed: item.jsMemoryUsed / 1024 / 1024,
        type: item.type
      });
    }

    if (dtoArr.length > 0) {
      await PerformanceItemDto.bulkCreate(dtoArr);
    }

    await MetricService.summaryMemory(sceneDto);
  }

  static async createFpsItem(sceneDto: SceneDto, scene: Scene) {
    let dtoArr = new Array();
    let sceneId = sceneDto.id;
    let artifacts = scene.getArtifacts();
    let { FpsGatherer } = artifacts;
    let metrics: Array<any>;
    if (FpsGatherer) {
      metrics = FpsGatherer.metrics;
    }

    if (!metrics || metrics.length == 0) {
      return;
    }

    let idx = 1;
    for (let item of metrics) {
      dtoArr.push(Object.assign(item, { sceneId, index: idx++ }));
    }

    if (dtoArr.length > 0) {
      await FpsDto.bulkCreate(dtoArr);
    }
  }

  static async createLoadingTime(sceneDto: SceneDto, scene: Scene, name: string) {
    let sceneId = sceneDto.id;
    let artifacts = scene.getArtifacts();
    let gatherer = artifacts[name];
    let apiTimes, dtoArr;

    if (!gatherer) {
      return;
    }

    for (let key of Object.keys(gatherer)) {
      dtoArr = [];
      apiTimes = [];
      let item = gatherer[key];
      let summaryDto = {
        sceneId,
        name: key,
        uiMaxTime: 0,
        uiAvgTime: 0,
        uiMinTime: 0,
        uiTop90Time: 0,
        uiTop95Time: 0,
        apiMaxTime: 0,
        apiAvgTime: 0,
        apiMinTime: 0,
        apiTop90Time: 0,
        apiTop95Time: 0,
        apiHandleCount: -1
      };

      if (item.api) {
        apiTimes = apiTimes.concat(item.api);
      }

      let sum, arr, costTime, min, max, maxHanleCount;
      if (apiTimes.length > 0) {
        sum = 0;
        max = 0;
        maxHanleCount = -1;
        min = 60000000;
        arr = [];
        for (let t of apiTimes) {
          if (!t) {
            continue;
          }
          costTime = t.time;
          sum += costTime;
          min = costTime > min ? min : costTime;
          max = costTime > max ? costTime : max;
          if (t.count >= 0) {
            maxHanleCount = t.count > maxHanleCount ? t.count : maxHanleCount;
          } else {
            t.count = -1;
          }
          arr.push(costTime);
          dtoArr.push({
            type: "API",
            costTime: costTime,
            handleCount: t.count,
            infos: JSON.stringify(t.infos)
          });
        }
        arr.sort((a, b) => {
          return a === b ? 0 : (a > b ? 1 : -1);
        });
        summaryDto.apiMaxTime = max;
        summaryDto.apiAvgTime = sum / arr.length;
        summaryDto.apiMinTime = min;
        summaryDto.apiTop90Time = arr[parseInt((0.9 * arr.length).toString())];
        summaryDto.apiTop95Time = arr[parseInt((0.95 * arr.length).toString())];
        summaryDto.apiHandleCount = maxHanleCount;
      }

      if (dtoArr.length > 0) {
        let summary = await LoadingTimeSummaryDto.create(summaryDto);

        for (let dto of dtoArr) {
          dto["summaryId"] = summary.id;
        }

        await LoadingTimeItemDto.bulkCreate(dtoArr);

        await MetricService.summaryLoadingTimeForVersion(sceneDto, summary);
      }
    }
  }

  static async summaryLoadingTimeForVersion(sceneDto: SceneDto, summary: LoadingTimeSummaryDto): Promise<void> {
    const isRelease = Config.jupiterHost === Config.jupiterReleaseHost;
    const isDevelop = Config.jupiterHost === Config.jupiterDevelopHost;
    const isStage = Config.jupiterHost === Config.jupiterStageHost;

    if (!isRelease && !isDevelop && !isStage) {
      return;
    }

    let version = await VersionDto.findOne({ where: { name: sceneDto.appVersion } });
    if (!version) {
      return;
    }

    const platform = 'chrome';
    let versions = await VersionDto.findAll({
      where: {
        name: {
          [Op.in]: [
            (await DashboardService.getVersionInfo(Config.jupiterDevelopHost)).jupiterVersion,
            (await DashboardService.getVersionInfo(Config.jupiterStageHost)).jupiterVersion
          ]
        }
      }
    });
    if (versions && versions.length > 0) {
      await LoadingTimeDevelopSummaryDto.destroy({ where: { versionId: { [Op.notIn]: versions.map(a => a.id) }, platform: platform, name: summary.name, isRelease: false } })
    }

    const release = isRelease ? 1 : 0;
    const versionName = isDevelop ? "develop" : version.name;

    let dtos = await LoadingTimeItemDto.sequelize['query']("select i.*, s.start_time from t_loading_time_summary ss  join t_scene s on s.id=ss.scene_id join t_loading_time_item i on i.summary_id=ss.id where ss.name=? and s.name=? and s.app_version=? and s.is_release=?",
      {
        replacements: [summary.name, sceneDto.name, sceneDto.appVersion, release],
        raw: true,
        type: Sequelize['QueryTypes']['SELECT']
      });

    if (!dtos || dtos.length === 0) {
      return;
    }

    let sum = 0, min = 60000000,
      max = 0, maxHanleCount = -1,
      arr = [], costTime, cnt, minTime, maxTime, time;

    minTime = maxTime = new Date(dtos[0]['start_time']).getTime();
    const map = {};
    for (let dto of dtos) {
      if (map[dto['summary_id']]) {
        map[dto['summary_id']].push(dto);
      } else {
        map[dto['summary_id']] = [dto];
      }

      time = new Date(dto['start_time']).getTime();
      minTime = minTime > time ? time : minTime;
      maxTime = maxTime < time ? time : maxTime;

      cnt = parseInt(dto['handle_count']);
      costTime = parseFloat(dto['cost_time']);
      arr.push(costTime);
      sum += costTime;
      min = costTime > min ? min : costTime;
      max = costTime > max ? costTime : max;
      if (cnt >= 0) {
        maxHanleCount = cnt > maxHanleCount ? cnt : maxHanleCount;
      } else {
        cnt = 0;
      }
    }

    arr.sort((a, b) => {
      return a === b ? 0 : (a > b ? 1 : -1);
    });

    let versionSummary = {
      versionId: version.id,
      version: versionName,
      name: summary.name,
      uiMaxTime: 0,
      uiAvgTime: 0,
      uiMinTime: 0,
      uiTop90Time: 0,
      uiTop95Time: 0,
      apiMaxTime: max,
      apiAvgTime: sum / arr.length,
      apiMinTime: min,
      apiTop90Time: arr[parseInt((0.9 * arr.length).toString())],
      apiTop95Time: arr[parseInt((0.95 * arr.length).toString())],
      apiHandleCount: cnt,
      isRelease: isRelease,
      platform: platform,
      time: DateUtils.getTimeRange(minTime, maxTime)
    }

    if (isDevelop || isRelease) {
      await LoadingTimeReleaseSummaryDto.destroy({
        where: {
          name: summary.name, version: versionName, platform: platform
        }
      });

      await LoadingTimeReleaseSummaryDto.create(versionSummary);
    }

    const where = {
      name: summary.name, versionId: version.id, isRelease, platform: platform
    };

    await LoadingTimeDevelopSummaryDto.destroy({ where });

    if (isRelease) {
      await LoadingTimeDevelopSummaryDto.create(versionSummary);
    } else {
      const summaryIds = Object.keys(map).map(a => parseInt(a));
      summaryIds.sort((a, b) => a > b ? 1 : -1);
      const points = [0, 0, 0, 0, 0, 0, 0]; // max 7 point for develop branch
      for (let i = 0; i < summaryIds.length; i++) {
        points[i % points.length]++;
      }

      let index = 0;
      let branchIndex = 1;
      for (let idx of points) {
        if (idx === 0) {
          continue;
        }

        let dtoArr = [];
        for (let i = 0; i < idx; i++) {
          dtoArr.push(...map[summaryIds[index++]]);
        }

        arr = [];
        sum = 0;
        min = 60000000;
        max = 0;

        maxHanleCount = -1;
        minTime = maxTime = new Date(dtoArr[0]['start_time']).getTime();
        for (let dto of dtoArr) {
          time = new Date(dto['start_time']).getTime();
          minTime = minTime > time ? time : minTime;
          maxTime = maxTime < time ? time : maxTime;

          cnt = parseInt(dto['handle_count']);
          costTime = parseFloat(dto['cost_time']);
          arr.push(costTime);
          sum += costTime;
          min = costTime > min ? min : costTime;
          max = costTime > max ? costTime : max;
          if (cnt >= 0) {
            maxHanleCount = cnt > maxHanleCount ? cnt : maxHanleCount;
          } else {
            cnt = 0;
          }
        }

        arr.sort((a, b) => {
          return a === b ? 0 : (a > b ? 1 : -1);
        });

        versionSummary = {
          versionId: version.id,
          version: [versionName, '_', branchIndex++].join(''),
          name: summary.name,
          uiMaxTime: 0,
          uiAvgTime: 0,
          uiMinTime: 0,
          uiTop90Time: 0,
          uiTop95Time: 0,
          apiMaxTime: max,
          apiAvgTime: sum / arr.length,
          apiMinTime: min,
          apiTop90Time: arr[parseInt((0.9 * arr.length).toString())],
          apiTop95Time: arr[parseInt((0.95 * arr.length).toString())],
          apiHandleCount: cnt,
          isRelease: isRelease,
          platform: platform,
          time: DateUtils.getTimeRange(minTime, maxTime)
        }

        await LoadingTimeDevelopSummaryDto.create(versionSummary);
      }
    }
  }

  static async summaryMemory(sceneDto: SceneDto): Promise<void> {
    if (!sceneDto || sceneDto.name.startsWith('FPS.')
      || ['LoginScene', 'OfflineScene', 'RefreshScene'].indexOf(sceneDto.name) >= 0) {
      return;
    }

    let items = await PerformanceItemDto.findAll({ where: { sceneId: sceneDto.id }, order: [['index', 'ASC']] });
    if (!items || items.length === 0) {
      return;
    }

    let version = await VersionDto.findOne({ where: { name: sceneDto.appVersion } });
    if (!version) {
      return;
    }

    // let arr1: Array<Array<number>> = [];
    // let arr2: Array<Array<number>> = [];
    let y: number, n = items.length;
    let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
    const avgCount = 5;
    let startArray: Array<number> = [], endArray: Array<number> = [];
    for (let x = 0; x < n; x++) {
      y = parseFloat('' + items[x].privateMemory);
      // arr1.push([x, y]);

      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumXY += x * y;

      if (x < avgCount) {
        startArray.push(y);
      }

      if (x >= (n - avgCount)) {
        endArray.push(y);
      }
    }

    let k = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let b = (sumY - k * sumX) / n;

    // for (let x = 0; x < n; x++) {
    //   arr2.push([x, k * x + b]);
    // }
    //console.log(JSON.stringify(arr1));
    //console.log(JSON.stringify(arr2));

    let startMemory = startArray.reduce((a, b) => a + b).valueOf() / startArray.length;
    let endMemory = endArray.reduce((a, b) => a + b).valueOf() / endArray.length;

    await MemoryDto.create({
      sceneId: sceneDto.id,
      sceneName: sceneDto.name,
      startMemory, endMemory, k, b,
      isRelease: sceneDto.isRelease,
      versionId: version.id,
      version: version.name,
      platform: sceneDto.platform
    });

    const where = {
      isRelease: sceneDto.isRelease, versionId: version.id, platform: sceneDto.platform, sceneName: sceneDto.name
    };

    await MemorySummaryDto.destroy({ where });

    let memoryDtos = await MemoryDto.findAll({ where });
    k = 0;
    b = 0;
    startMemory = 0;
    endMemory = 0;
    for (let dto of memoryDtos) {
      k += parseFloat('' + dto.k);
      b += parseFloat('' + dto.b);
      startMemory += parseFloat('' + dto.startMemory);
      endMemory += parseFloat('' + dto.endMemory);
    }

    k = k / memoryDtos.length;
    b = b / memoryDtos.length;
    startMemory = startMemory / memoryDtos.length;
    endMemory = endMemory / memoryDtos.length;

    await MemorySummaryDto.create({
      sceneName: sceneDto.name,
      startMemory, endMemory, k, b,
      isRelease: sceneDto.isRelease,
      versionId: version.id,
      version: version.name,
      platform: sceneDto.platform
    });
  }
}

export { MetricService };
