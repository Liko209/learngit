/*
 * @Author: doyle.wu
 * @Date: 2019-07-05 09:37:16
 */
import * as fs from 'fs';
import * as path from 'path';
import { LogUtils } from '../../utils';
import { DashboardConfig, DashboardMetricItemConfig } from './config';

const logger = LogUtils.getLogger(__filename);

let _config;


const getDashboardConfig = (): DashboardConfig => {
  if (_config) {
    return _config;
  }

  _config = new DashboardConfig();

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
          const { name, gatherer, k, b, memoryUrl, metric } = scene;
          if (name && gatherer && memoryUrl && metric && metric instanceof Array) {
            const map: { [key: string]: DashboardMetricItemConfig } = {};
            for (let item of metric) {
              const { url, apiGoal } = item;
              const metricName = item['name'];
              if (url && metricName && apiGoal && typeof apiGoal === 'number'
                && k && typeof k === 'number'
                && b && typeof b === 'number') {
                map[metricName] = {
                  url, apiGoal, name: metricName
                }
              }
            }

            if (Object.keys(map).length === 0) {
              continue;
            }
            _config.scenes[name] = {
              name, gatherer, memoryUrl, k, b, metric: map
            }
          }
        }
      }
    }
  }
  return _config;
}

export {
  getDashboardConfig
}
