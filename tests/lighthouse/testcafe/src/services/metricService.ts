/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:00:41
 */
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Config, h, Globals } from '..';
import { DateUtils } from "../utils";
import {
  TaskDto,
  SceneDto,
  LoadingTimeSummaryDto,
  LoadingTimeItemDto,
  VersionDto,
  LoadingTimeDevelopSummaryDto,
  LoadingTimeReleaseSummaryDto
} from "../dtos";

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

  static async createScene(taskDto: TaskDto, t: TestController): Promise<SceneDto> {
    let platform = h(t).getBrowser().name;
    let uri = Config.jupiterHost;
    let aliasUri = uri;
    let startTime = Globals.startTime;
    let endTime = Globals.endTime;
    let performance, accessibility, bestPractices, seo, pwa;
    let taskId = taskDto.id,
      name = h(t).getSceneName();
    let appVersion = h(t).getVersion(Config.jupiterHost).jupiterVersion;

    performance = accessibility = bestPractices = seo = pwa = 0;

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

  static async createLoadingTime(sceneDto: SceneDto, t: TestController) {
    let sceneId = sceneDto.id;
    let gatherer = h(t).getMetricHelper().getResult();
    let apiTimes, dtoArr;

    if (!gatherer) {
      return;
    }

    const keys = Object.keys(gatherer);

    for (let key of keys) {
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

      if (item) {
        apiTimes = apiTimes.concat(item);
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

        await MetricService.summaryLoadingTimeForVersion(sceneDto, summary, t);
      }
    }
  }

  static async summaryLoadingTimeForVersion(sceneDto: SceneDto, summary: LoadingTimeSummaryDto, t: TestController): Promise<void> {
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

    const platform = h(t).getBrowser().name;
    let versions = await VersionDto.findAll({
      where: {
        name: {
          [Op.in]: [
            Globals.versions[Config.jupiterDevelopHost].jupiterVersion,
            Globals.versions[Config.jupiterStageHost].jupiterVersion,
          ]
        }
      }
    });
    if (versions && versions.length > 0) {
      await LoadingTimeDevelopSummaryDto.destroy({ where: { versionId: { [Op.notIn]: versions.map(a => a.id) }, platform: platform, name: summary.name, isRelease: false } })
    }

    const release = isRelease ? 1 : 0;
    const versionName = isDevelop ? "develop" : version.name;

    let dtos = await LoadingTimeItemDto.sequelize.query("select i.*, s.start_time from t_loading_time_summary ss  join t_scene s on s.id=ss.scene_id join t_loading_time_item i on i.summary_id=ss.id where ss.name=? and s.name=? and s.app_version=? and s.is_release=?",
      {
        replacements: [summary.name, sceneDto.name, sceneDto.appVersion, release],
        raw: true,
        type: Sequelize.QueryTypes.SELECT
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
}

export { MetricService };
