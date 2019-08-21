/*
 * @Author: Paynter Chen
 * @Date: 2019-05-15 17:28:32
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem, ZipItemLevel } from './types';
import _ from 'lodash';
import { HealthModuleManager } from 'foundation/health';
import { toText } from 'sdk/utils';

export class HealthStatusItemProvider implements IZipItemProvider {
  level = ZipItemLevel.NORMAL;
  getZipItems = async () => {
    const modules = HealthModuleManager.getInstance().getAll();
    const results = await Promise.all(
      _.flatMap(modules, _module => [
        `=========== ${_module.name} ==========\n`,
        ..._module.getAll().map(item => {
          const result = item.getStatus();
          if (_.isObject(result) && result['then']) {
            return result.then(
              (status: any) => `[ ${item.name} ]\n\n${toText(status)}\n`,
            );
          }
          return `[ ${item.name} ]\n\n${toText(result)}\n`;
        }),
      ]),
    );
    return [
      {
        type: '.txt',
        name: 'HealthStatus',
        content: results.join('\n'),
      } as ZipItem,
    ];
  };
}
