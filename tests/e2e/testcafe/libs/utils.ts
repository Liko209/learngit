import * as _ from 'lodash';
import * as G from 'glob';
import * as path from 'path';
import * as fs from 'fs';

export function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s => s.trim());
}

export function flattenGlobs(globs: string[]): string[] {
  return _(globs).flatMap(g => G.sync(g)).uniq().value();
}

export class ExecutionStrategiesHelper {

  static VALID_ACTIONS = ['on_push', 'on_merge'];

  config: any;

  loadConfig() {
    const config_path = path.join(this.configsDir, this.branch) + '.json';
    const default_path = path.join(this.configsDir, 'default.json');
    this.config = require(default_path);
    if (fs.existsSync(config_path)) {
      _.merge(this.config, require(config_path));
    }
    console.log(`execution options:`);
    console.log(this.config);
  }

  constructor(
    private branch: string,
    private action: string,
    private configsDir: string,
    private defaultBranch: string = 'default',
    private defaultAction: string = 'on_push',
  ) {
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
