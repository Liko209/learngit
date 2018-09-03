import * as _ from 'lodash';
import * as G from 'glob';

export function parseArgs(argsString: string) {
  return argsString.split(',').filter(Boolean).map(s => s.trim());
}

export function flattenGlobs(globs: string[]): string[] {
  return _(globs).flatMap(g => G.sync(g)).uniq().value();
}
