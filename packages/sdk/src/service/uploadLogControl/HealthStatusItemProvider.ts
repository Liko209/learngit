/*
 * @Author: Paynter Chen
 * @Date: 2019-05-15 17:28:32
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem } from './types';
import _ from 'lodash';
import { HealthModuleManager } from 'foundation';
import { toText } from 'sdk/utils';

export class HealthStatusItemProvider implements IZipItemProvider {
  getZipItems = async () => {
    const modules = HealthModuleManager.getInstance().getAll();
    const results = await Promise.all(
      modules.flatMap(_module => {
        return [
          `=========== ${_module.name} ==========\n`,
          ..._module.getAll().map(item => {
            if (item.getStatus['then']) {
              return item
                .getStatus()
                .then(
                  (status: any) =>
                    `----- ${item.name} -----\n\n${toText(status)}\n`,
                );
            }
            return `----- ${item.name} -----\n\n${toText(item.getStatus())}\n`;
          }),
        ];
      }),
    );
    return [
      {
        type: '.txt',
        name: 'HealthStatus',
        content: results.join('\n'),
      } as ZipItem,
    ];
  }
}
