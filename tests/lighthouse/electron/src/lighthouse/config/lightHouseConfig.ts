/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 14:20:08
 */

import { Pass } from './Pass';
import { Setting } from './Setting';
import { ProcessAudit } from '../audit';
import { ProcessGatherer, MemoryGatherer } from '../gatherer';

const defaultConfig = require('lighthouse/lighthouse-core/config/default-config');

class LightHouseConfig {
  public name: string = '';

  // settings
  public settings: Setting = new Setting();

  // passes
  public passes: Array<Pass> = [{
    passName: 'defaultPass',
    recordTrace: true,
    useThrottling: true,
    pauseAfterLoadMs: 1000,
    networkQuietThresholdMs: 1000,
    cpuQuietThresholdMs: 1000,
    gatherers: [
      ...defaultConfig.passes[0].gatherers,
      'js-usage',
      {
        instance: new ProcessGatherer()
      },
      {
        instance: new MemoryGatherer()
      }
    ],
  },
  defaultConfig.passes[1], defaultConfig.passes[2]];

  // audits
  public audits: Array<any> = [
    ...defaultConfig.audits,
    'byte-efficiency/unused-javascript',
    {
      implementation: ProcessAudit
    }
  ];

  // groups
  public groups = defaultConfig.groups;

  // categories
  public categories = {
    'performance': {
      title: 'Performance',
      auditRefs: [
        ...defaultConfig.categories['performance'].auditRefs,
        { id: 'unused-javascript', weight: 0, group: 'load-opportunities' },
        { id: 'process-performance-metrics', weight: 0, group: 'diagnostics' },
      ],
    },
    'pwa': defaultConfig.categories['pwa'],
    'accessibility': defaultConfig.categories['accessibility'],
    'best-practices': defaultConfig.categories['best-practices'],
    'seo': defaultConfig.categories['seo']
  };

  toJSON() {
    return {
      settings: this.settings,
      passes: this.passes,
      audits: this.audits,
      groups: this.groups,
      categories: this.categories
    };
  }
}

export { LightHouseConfig };
