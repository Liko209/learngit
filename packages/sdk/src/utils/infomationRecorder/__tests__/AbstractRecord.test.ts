/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 23:07:04
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractRecord } from '../AbstractRecord';
type TestRecord = {
  toggle: boolean;
  time: number;
  infos: string[];
  logs: string[];
};

describe('AbstractRecord', () => {
  describe('setProperty()', () => {
    it('should set property successfully', () => {
      const record = new AbstractRecord<TestRecord>({});
      record.setProperty('toggle', true);
      expect(record.getRecord().toggle).toEqual(true);
      record.setProperty('toggle', false);
      expect(record.getRecord().toggle).toEqual(false);
      record.setProperty('time', 123);
      expect(record.getRecord().time).toEqual(123);
    });
    it('should set array property successfully', () => {
      const record = new AbstractRecord<TestRecord>({});
      record.setProperty('infos', ['a']);
      expect(record.getRecord().infos).toEqual(['a']);
      record.setProperty('infos', ['b']);
      expect(record.getRecord().infos).toEqual(['a', 'b']);
      record.setProperty('infos', ['c'], false);
      expect(record.getRecord().infos).toEqual(['c']);
    });
  });

  describe('addLogs()', () => {
    it('should add log successfully', () => {
      const record = new AbstractRecord<TestRecord>({});
      record.addLogs('heihei');
      expect(record.getRecord().logs).toEqual(['heihei']);
    });
  });
});
