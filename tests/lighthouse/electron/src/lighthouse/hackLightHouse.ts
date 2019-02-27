/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 14:50:11
 */
import { Config } from '../config';
import * as bluebird from 'bluebird';

const GatherRunner = require("lighthouse/lighthouse-core/gather/gather-runner");

const hackLightHouse = async () => {
  GatherRunner.loadBlank = async (driver) => {
    await driver.gotoURL(Config.blankUrl, { waitForNavigated: true });
    await bluebird.delay(1000);
  };
};


export {
  hackLightHouse
}
