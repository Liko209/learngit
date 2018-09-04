import * as _ from 'lodash';
import * as G from 'glob';
import * as PATH from 'path';

import { APP_ROOT } from '../config';

export function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s => s.trim());
}

export function flattenGlobs(globs: string[]): string[] {
  return _(globs).flatMap(g => G.sync(g)).uniq().value();
}

export class ExecutionStrategiesHelper {
  static VALID_ACTIONS = ['on_push', 'on_merge'];
  config: any;

  static getConfigFromJson(branch: string) {
    const items = branch.split('/');
    const file = items.pop().concat('.json');
    const paths = G.sync(APP_ROOT + '/config/'.concat(items.join('/')).concat(file));

    if (!_.isEmpty(paths)) {
      const path = paths[0];
      const config = require(path);
      return config;
    }
    const path = APP_ROOT + '/config/default.json';
    const config = require(path);
    return config;
  }

  constructor(
    private branch: string,
    private action: string,
    private defaultBranch: string = 'default',
    private defaultAction: string = 'on_push',
  ) {
    this.config = ExecutionStrategiesHelper.getConfigFromJson(branch);
  }

  private _isValidAction() {
    return ExecutionStrategiesHelper.VALID_ACTIONS.indexOf(this.action) >= 0;
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

  get browsers(): string[] {
    return this._getAttribute('browsers');
  }
}
