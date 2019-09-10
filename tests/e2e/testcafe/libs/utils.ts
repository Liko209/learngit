import * as _ from 'lodash';
import * as G from 'glob';
import * as path from 'path';
import * as fs from 'fs';

import { getLogger } from 'log4js';
const logger = getLogger(__filename);
logger.level = 'info';

export function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s => s.trim());
}

export function flattenGlobs(globs: string[], needShuffle: Boolean = false) {
  let newArray = _(globs).flatMap(g => G.sync(g)).uniq().value();
  if (needShuffle) {
    return _.shuffle(newArray);
  }
  return newArray;
}

export class ConfigLoader {

  static ACTIONS = ['on_push', 'on_merge', 'on_debug'];

  config: any;

  load() {
    const defaultConfigFile = path.join(this.configsDir, `${this.defaultBranch}.json`);
    const configFile = path.join(this.configsDir, `${this.branch}.json`);
    this.config = require(defaultConfigFile);
    if (fs.existsSync(configFile)) {
      logger.info(`load custom configuration from ${configFile}`);
      _.mergeWith(this.config, require(configFile),
        (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            return srcValue;
          }
        });
    }
  }

  constructor(
    private branch: string,
    private action: string,
    private configsDir: string,
    private defaultBranch: string = 'develop',
    private defaultAction: string = 'on_debug',
  ) {
  }

  private _isValidAction() {
    return ConfigLoader.ACTIONS.indexOf(this.action) >= 0;
  }

  private _getActionOrElseDefault(): string {
    return this._isValidAction() ? this.action : this.defaultAction;
  }

  private _getAttribute(attributeName: string) {
    const path = [this._getActionOrElseDefault(), attributeName];
    return _.get(this.config, path);
  }

  get fixtures(): string[] {
    return this._getAttribute('fixtures');
  }

  get includeTags(): string[] {
    return this._getAttribute('include_tags');
  }

  get excludeTags(): string[] {
    return this._getAttribute('exclude_tags');
  }

  get caseFilter(): string {
    return this._getAttribute('case_filter');
  }

  get browsers(): string[] {
    return this._getAttribute('browsers');
  }
}
