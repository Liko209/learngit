/*
 * @Author: Paynter Chen
 * @Date: 2019-07-31 11:41:32
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogChunkSplitStrategy } from './types';
import { extractLogMessageLine } from './utils';
import { LogEntity, LOG_LEVEL } from 'foundation/log';
import _ from 'lodash';

export class ErrorChunkStrategy implements ILogChunkSplitStrategy {
  private _getLogLines(
    logs: LogEntity[],
    startIndex: number,
    limit: number,
    reverse?: boolean,
  ): [number, string[]] {
    const logMessageLines = [];
    const step = reverse ? -1 : 1;
    let size = 0;

    for (
      let index = startIndex;
      reverse ? index > 0 : index < logs.length;
      index += step
    ) {
      const log = logs[index];
      const line = extractLogMessageLine(log);
      const lineBytes = log.size + 2;
      if (size + lineBytes > limit) {
        break;
      }
      size += lineBytes;
      logMessageLines.push(line);
    }
    return [size, reverse ? _.reverse(logMessageLines) : logMessageLines];
  }

  split(logs: LogEntity[], size: number) {
    const firstErrorLogIndex =
      _.findIndex(logs, log => log.level >= LOG_LEVEL.ERROR) || 0;
    const [preLogsSize, preLogLines] = this._getLogLines(
      logs,
      firstErrorLogIndex,
      size,
      true,
    );
    const [, nextLogLines] = this._getLogLines(
      logs,
      firstErrorLogIndex + 1,
      size - preLogsSize,
      false,
    );
    const lines = [...preLogLines, ...nextLogLines];
    return lines.length ? [`${lines.join('')}`] : [];
  }
}
