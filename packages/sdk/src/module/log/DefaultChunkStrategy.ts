/*
 * @Author: Paynter Chen
 * @Date: 2019-07-31 11:41:35
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogChunkSplitStrategy } from './types';
import { extractLogMessageLine } from './utils';
import { LogEntity } from 'foundation/log';

export class DefaultChunkStrategy implements ILogChunkSplitStrategy {
  private _getEndIndex(array: LogEntity[], limit: number, startIndex: number) {
    let size = 0;

    for (let index = startIndex; index < array.length; index += 1) {
      const log = array[index];
      const lineBytes = log.size + 2;
      if (size + lineBytes > limit) {
        return index - 1;
      }
      size += lineBytes;
    }
    return array.length - 1;
  }

  split(logs: LogEntity[], size: number, startIndex: number = 0): string[] {
    const endIndex = this._getEndIndex(logs, size, startIndex);
    if (endIndex === -1) {
      return [];
    }
    const dataChunk = logs
      .slice(startIndex, endIndex + 1)
      .map(log => extractLogMessageLine(log))
      .join('');
    if (endIndex < logs.length - 1) {
      return [dataChunk, ...this.split(logs, size, endIndex + 1)];
    }
    return [dataChunk];
  }
}
