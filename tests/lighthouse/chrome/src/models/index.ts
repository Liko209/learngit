/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 10:28:29
 */
import { Sequelize, ISequelizeConfig } from 'sequelize-typescript';
import { TaskDto } from "./task";
import { SceneDto } from "./scene";
import { PerformanceDto, PerformanceItemDto } from "./performance";
import { FpsDto } from "./fps";
import { VersionDto } from "./version";
import {
  LoadingTimeSummaryDto, LoadingTimeItemDto,
  LoadingTimeReleaseSummaryDto, LoadingTimeDevelopSummaryDto
} from "./loadingTime";
import { MemoryDto, MemorySummaryDto } from "./memory";
import { Config } from "../config";
import { LogUtils } from "../utils/logUtils";

const logger = LogUtils.getLogger(__filename);

const sequelizeConfig: ISequelizeConfig = {
  database: Config.dbName,
  username: Config.dbUser,
  password: Config.dbPassword,
  host: Config.dbHost,
  port: Config.dbPort,
  dialect: Config.dbDialect,
  // operatorsAliases: false,
  logging: false,
  timezone: '+08:00',
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  },
  pool: {
    max: Config.dbPoolMax,
    min: Config.dbPoolMin,
    acquire: Config.dbPoolAcquire,
    idle: Config.dbPoolIdle
  }
}

const sequelize = new Sequelize(sequelizeConfig);

const initModel = async () => {
  const models = [
    TaskDto,
    SceneDto,
    PerformanceDto,
    PerformanceItemDto,
    LoadingTimeSummaryDto,
    LoadingTimeItemDto,
    FpsDto,
    VersionDto,
    LoadingTimeReleaseSummaryDto,
    LoadingTimeDevelopSummaryDto,
    MemoryDto,
    MemorySummaryDto
  ];

  sequelize.addModels(models);

  let msg = [];
  for (let model of models) {
    // try to create table if not exist.
    await model.sync({ force: false, logging: false });

    msg.push(`Table[${model.getTableName()}] sync success.`);
  }
  logger.info(msg.join('\n\r'));
};

const closeDB = async () => {
  await sequelize['close']();
  logger.info('db connection closed.');
}

export {
  initModel,
  closeDB,
  TaskDto,
  SceneDto,
  PerformanceDto,
  PerformanceItemDto,
  LoadingTimeSummaryDto,
  LoadingTimeItemDto,
  FpsDto,
  VersionDto,
  LoadingTimeReleaseSummaryDto,
  LoadingTimeDevelopSummaryDto,
  MemoryDto,
  MemorySummaryDto
};
