/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:00:41
 */
import { Scene } from "../scenes";
import { Config } from '../config';
import { PerformanceMetric } from "../gatherers";
import {
  TaskDto,
  SceneDto,
  PerformanceDto,
  PerformanceItemDto,
  LoadingTimeSummaryDto,
  LoadingTimeItemDto,
  FpsDto
} from "../models";

class MetricService {
  static async createTask(): Promise<TaskDto> {
    return await TaskDto.create({
      host: Config.jupiterHost,
      status: "0",
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
      endTime
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
    let { ProcessGatherer } = artifacts;
    let metrics: Array<PerformanceMetric>;
    if (ProcessGatherer) {
      metrics = ProcessGatherer.metrics;
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
    let apiTimes = [],
      dtoArr = [];

    if (!gatherer) {
      return;
    }

    for (let key of Object.keys(gatherer)) {
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
        apiTop95Time: 0
      };

      if (item.api) {
        apiTimes = apiTimes.concat(item.api);
      }

      let sum, arr, costTime, min, max;
      if (apiTimes.length > 0) {
        sum = 0;
        max = 0;
        min = 60000000;
        arr = [];
        for (let t of apiTimes) {
          if (!t) {
            continue;
          }
          costTime = t.endTime - t.startTime;
          sum += costTime;
          min = costTime > min ? min : costTime;
          max = costTime > max ? costTime : max;
          arr.push(costTime);
          dtoArr.push({
            type: "API",
            startTime: t.startTime,
            endTime: t.endTime,
            costTime: costTime
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
      }

      let summary = await LoadingTimeSummaryDto.create(summaryDto);

      if (dtoArr.length > 0) {
        for (let dto of dtoArr) {
          dto["summaryId"] = summary.id;
        }
        await LoadingTimeItemDto.bulkCreate(dtoArr);
      }
    }
  }
}

export { MetricService };
