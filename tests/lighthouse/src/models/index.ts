/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 10:28:29
 */
import { TaskDto } from "./Task";
import { SceneDto } from "./Scene";
import { PerformanceDto, PerformanceItemDto } from "./Performance";
import { LoadingTimeSummaryDto, LoadingTimeItemDto } from "./LoadingTime";
import { dbUtils } from "../utils/DbUtils";

const initModel = async () => {
  const models = [
    TaskDto,
    SceneDto,
    PerformanceDto,
    PerformanceItemDto,
    LoadingTimeSummaryDto,
    LoadingTimeItemDto
  ];

  await dbUtils.addModels(models);
};

export {
  initModel,
  TaskDto,
  SceneDto,
  PerformanceDto,
  PerformanceItemDto,
  LoadingTimeSummaryDto,
  LoadingTimeItemDto
};
