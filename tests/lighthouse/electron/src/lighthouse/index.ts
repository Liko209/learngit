/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 17:03:00
 */
import { Config } from '../config';
import { hackLightHouse } from './hackLightHouse';
import { ElectronConnection } from './electronConnection';
import { LightHouseConfig, ScenarioConfigFactory } from './config';
import { LogUtils } from '../utils';
import * as http from 'http';
import * as lighthouse from "lighthouse";
import * as reportGenerater from "lighthouse/lighthouse-core/report/report-generator";
import * as gatherers from './gatherer';
import * as kill from 'kill-port';

const logger = LogUtils.getLogger(__filename);

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(['<html><head><title>about:blank</title></head><body>about:blank</body>',
    '<script>',
    `if(location.search === "") {location.href=location.href+"?t=${Date.now()}"};`,
    '</script></html>'].join(''));
});

const startBlankServer = () => {
  return new Promise(resolve => {
    server.listen(Config.blankServerPort);
    logger.info(`start blank server, listen on ${Config.blankServerPort}, listing: ${server.listening}`);
    resolve();
  })
}

const stopBlankServer = () => {
  return new Promise(resolve => {
    if (server.listening) {
      server.close(() => {
        logger.info(`stop blank server, listing: ${server.listening}`);
        resolve();
      });
    } else {
      logger.info(`blank server has been stoped, listing: ${server.listening}`);
      resolve();
    }
  });
}

const closeElectron = async () => {
  try {
    await kill(Config.electronDebugPort)
  } catch (err) {
  }
}

export {
  hackLightHouse,
  closeElectron,
  ElectronConnection,
  LightHouseConfig,
  lighthouse,
  reportGenerater,
  startBlankServer,
  stopBlankServer,
  gatherers,
  ScenarioConfigFactory
}
