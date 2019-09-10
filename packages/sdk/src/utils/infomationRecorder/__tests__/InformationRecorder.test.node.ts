/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 23:07:04
 * Copyright © RingCentral. All rights reserved.
 */
import { InformationRecorder } from '../InformationRecorder';
import { AbstractRecord } from '../AbstractRecord';
import { LOG_LEVEL } from 'foundation/log';

type TestRecord = {
  toggle: boolean;
  time: number;
  infos: string[];
  logs: string[];
};

describe('InformationRecorder', () => {
  describe('getName()', () => {
    it('should getName correctly', () => {
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
      );
      expect(recorder.getName()).toEqual('test');
    });
  });

  describe('startTransaction()', () => {
    it('should create record when startTransaction', () => {
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
      );
      expect(recorder.getCurrentRecord()).toEqual(null);
      recorder.startTransaction();
      expect(recorder.getCurrentRecord()).not.toEqual(null);
      recorder.endTransaction();
      expect(recorder.getCurrentRecord()).toEqual(null);
    });
  });

  describe('endTransaction()', () => {
    it('should push currentRecord to history when endTransaction', () => {
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
      );
      expect(recorder.getRecordHistory().length).toEqual(0);
      expect(recorder.getAllRecords().length).toEqual(0);
      expect(recorder.getLatestRecord()).toEqual(null);
      recorder.startTransaction();
      expect(recorder.getRecordHistory().length).toEqual(0);
      expect(recorder.getAllRecords().length).toEqual(1);
      expect(recorder.getLatestRecord()).toEqual(null);
      recorder.endTransaction();
      expect(recorder.getRecordHistory().length).toEqual(1);
      expect(recorder.getAllRecords().length).toEqual(1);
      expect(recorder.getLatestRecord()).not.toEqual(null);
    });
  });

  describe('set()', () => {
    it('should set property to Record correctly', () => {
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
      );
      recorder.set('toggle', true);
      expect(recorder.getCurrentRecord().toggle).toEqual(true);
      recorder.set('toggle', false);
      expect(recorder.getCurrentRecord().toggle).toEqual(false);
    });
  });

  describe('log()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: true,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.log('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.LOG, 'haha');
    });
  });

  describe('debug()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: false,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.debug('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.DEBUG, 'haha');
    });
  });

  describe('info()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: false,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.info('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.INFO, 'haha');
    });
  });

  describe('error()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: false,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.error('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.ERROR, 'haha');
    });
  });

  describe('fatal()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: false,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.fatal('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.FATAL, 'haha');
    });
  });

  describe('warn()', () => {
    it('should call _log correctly', () => {
      const LOG_TAG = 'LOG_TAG';
      const recorder = new InformationRecorder<TestRecord>(
        'test',
        () => new AbstractRecord({}),
        {
          logIntegration: false,
          logTags: [LOG_TAG],
        },
      );
      jest.spyOn(recorder, '_log');
      recorder.warn('haha');
      expect(recorder['_log']).toBeCalledWith(LOG_LEVEL.WARN, 'haha');
    });
  });
});
