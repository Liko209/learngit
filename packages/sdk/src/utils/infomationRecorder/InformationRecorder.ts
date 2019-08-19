/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 10:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractRecord } from './AbstractRecord';
import { Nullable } from 'sdk/types';
import {
  ILogger, logManager, stringifyParams, LOG_LEVEL,
} from 'foundation/log';
import { toText } from '../stringUtils';
import _ from 'lodash';

type RecorderOptions = {
  logIntegration: boolean;
  logger: ILogger;
  setLog: boolean;
  logTags?: string[];
  limit: number;
  onTransactionEnd: () => void;
};

type SetOptions = {
  addible: boolean;
  tag?: string;
};

const DEFAULT_SET_OPTIONS: SetOptions = {
  addible: true,
};

const LOG_LEVEL_MAP: { [key in LOG_LEVEL]: string } = {
  [LOG_LEVEL.FATAL]: 'fatal',
  [LOG_LEVEL.ERROR]: 'error',
  [LOG_LEVEL.WARN]: 'warn',
  [LOG_LEVEL.INFO]: 'info',
  [LOG_LEVEL.DEBUG]: 'debug',
  [LOG_LEVEL.LOG]: 'log',
};

const LOG_TAG = '[InformationRecord]';

function ensureOptions<Options>(
  defaultOptions: Options,
  partialOptions?: Partial<Options>,
): Options {
  return {
    ...defaultOptions,
    ...partialOptions,
  };
}

export class InformationRecorder<R> {
  private _recordHistory: AbstractRecord<R>[] = [];

  private _currentRecord: Nullable<AbstractRecord<R>>;

  private _isInTransaction: boolean = false;

  private _options: RecorderOptions;

  private _DEFAULT_OPTIONS: RecorderOptions = {
    logIntegration: true,
    logger: logManager.getLogger('[InformationRecorder]'),
    setLog: true,
    limit: 10,
    onTransactionEnd: () => {
      this._options.logIntegration &&
        this._options.logger
          .tags(...this._getLogTag(), '[Record]')
          .info(toText(this.getLatestRecord()));
    },
  };

  constructor(
    private _name: string,
    private _creator: () => AbstractRecord<R>,
    options?: Partial<RecorderOptions>,
  ) {
    this._options = this._ensureOptions(options);
  }

  private _getLogTag(tag?: string) {
    const optionLogTags = this._options.logTags || [];
    return tag ? [LOG_TAG, ...optionLogTags, tag] : [LOG_TAG, ...optionLogTags];
  }

  private _ensureOptions(options?: Partial<RecorderOptions>): RecorderOptions {
    return ensureOptions(this._DEFAULT_OPTIONS, options);
  }

  private _ensureInTransaction() {
    if (!this._isInTransaction) {
      this.startTransaction();
    }
  }

  private _log(level: LOG_LEVEL, ...params: any): this {
    this._ensureInTransaction();
    this._currentRecord!.addLogs(stringifyParams(...params).join(' '));
    this._options.logIntegration &&
      this._options.logger.tags(...this._getLogTag())[LOG_LEVEL_MAP[level]](...params);
    return this;
  }

  getName() {
    return this._name;
  }

  startTransaction(): this {
    if (this._isInTransaction) {
      this.endTransaction();
    }
    this._isInTransaction = true;
    this._currentRecord = this._creator();
    return this;
  }

  endTransaction() {
    if (this._isInTransaction && this._currentRecord) {
      this._isInTransaction = false;
      this._recordHistory.push(this._currentRecord);
      if (this._recordHistory.length > this._options.limit) {
        this._recordHistory.shift();
      }
      this._currentRecord = null;
      this._options.onTransactionEnd();
    }
  }

  getRecordHistory() {
    return this._recordHistory.map((r: AbstractRecord<R>) => r.getRecord());
  }

  getAllRecords() {
    const currentRecord = this.getCurrentRecord();
    return currentRecord
      ? [...this.getRecordHistory(), currentRecord]
      : this.getRecordHistory();
  }

  getCurrentRecord() {
    return this._currentRecord ? this._currentRecord.getRecord() : null;
  }

  getLatestRecord() {
    return _.last(this.getRecordHistory()) || null;
  }

  set<K extends keyof R>(
    key: K,
    property: R[K],
    options?: Partial<SetOptions>,
  ): this {
    const { addible, tag } = ensureOptions(DEFAULT_SET_OPTIONS, options);
    this._ensureInTransaction();
    this._currentRecord!.setProperty(key, property, addible);
    this._options.logIntegration &&
      this._options.setLog &&
      this._options.logger
        .tags(...this._getLogTag(tag), '[setProperty]')
        .info(key, property);
    return this;
  }

  log(...params: any): this {
    return this._log(LOG_LEVEL.LOG, ...params);
  }

  debug(...params: any): this {
    return this._log(LOG_LEVEL.DEBUG, ...params);
  }

  info(...params: any): this {
    return this._log(LOG_LEVEL.INFO, ...params);
  }

  warn(...params: any): this {
    return this._log(LOG_LEVEL.WARN, ...params);
  }

  error(...params: any): this {
    return this._log(LOG_LEVEL.ERROR, ...params);
  }

  fatal(...params: any): this {
    return this._log(LOG_LEVEL.FATAL, ...params);
  }
}
