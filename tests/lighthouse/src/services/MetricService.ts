/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:00:41
 */
import { Scene } from "../scenes";
import { PerformanceMetric } from "../gatherers/ProcessGatherer";
import {
  TaskDto,
  SceneDto,
  PerformanceDto,
  PerformanceItemDto
} from "../models";
class MetriceService {
  async createTask(): Promise<TaskDto> {
    return await TaskDto.create({
      host: process.env.JUPITER_HOST,
      status: "0",
      startTime: new Date()
    });
  }

  async updateTaskForEnd(taskDto: TaskDto, status: string) {
    await TaskDto.update(
      {
        status: status,
        endTime: new Date()
      },
      { where: { id: taskDto.id } }
    );
  }

  async createScene(taskDto: TaskDto, scene: Scene): Promise<SceneDto> {
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
      performance,
      accessibility,
      bestPractices,
      seo,
      pwa,
      startTime,
      endTime
    });
  }

  async createPerformance(sceneDto: SceneDto, scene: Scene) {
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

  async createPerformanceItem(sceneDto: SceneDto, scene: Scene) {
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

  async createLoadingTime(sceneDto: SceneDto, scene: Scene, name: string) {
    let sceneId = sceneDto.id;
    let artifacts = scene.getArtifacts();
    let gatherer = artifacts[name];
    let apiTimes = [],
      uiTimes = [];

    if (gatherer) {
      if (gatherer.api) {
        apiTimes = apiTimes.concat(gatherer.api);
      }
      if (gatherer.ui) {
        uiTimes = uiTimes.concat(gatherer.ui);
      }
    }
  }
}

const metriceService = new MetriceService();

export { metriceService };
