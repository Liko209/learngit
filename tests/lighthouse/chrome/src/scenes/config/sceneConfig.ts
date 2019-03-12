/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 12:30:45
 */
import { Pass } from './pass';
import { Setting } from './setting';
import { ProcessGatherer, MemoryGatherer } from '../../gatherers';
import { ProcessAudit } from '../../audits';

const defaultConfig = require('lighthouse/lighthouse-core/config/default-config');

class SceneConfig {
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

  toLightHouseConfig() {
    return {
      settings: this.settings,
      passes: this.passes,
      audits: this.audits,
      groups: this.groups,
      categories: this.categories
    };
  }
}

export { SceneConfig };
