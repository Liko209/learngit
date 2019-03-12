/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 10:28:29
 */
import { Sequelize, Model } from 'sequelize-typescript';
import { Config } from "../config";
import { TaskDto } from "./task";
import { SceneDto } from "./scene";
import { PerformanceDto, PerformanceItemDto } from "./performance";
import { LoadingTimeSummaryDto, LoadingTimeItemDto } from "./loadingTime";
import { LogUtils } from '../utils';

const logger = LogUtils.getLogger(__filename);

const sequelize = new Sequelize({
  database: Config.dbName,
  username: Config.dbUser,
  password: Config.dbPassword,
  host: Config.dbHost,
  port: Config.dbPort,
  dialect: Config.dbDialect,
  operatorsAliases: false,
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
});

const initModel = async () => {
  let models: Array<typeof Model> = [
    TaskDto,
    SceneDto,
    PerformanceDto,
    PerformanceItemDto,
    LoadingTimeSummaryDto,
    LoadingTimeItemDto
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
  await sequelize.close();
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
  LoadingTimeItemDto
};
