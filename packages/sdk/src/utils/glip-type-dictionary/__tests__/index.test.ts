/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-13 15:15:05
 * Copyright © RingCentral. All rights reserved.
 */
import { getSocketMessageKey } from '../index';
describe('index', () => {
  describe('getSocketMessageKey', () => {
    it('should return item if id is integration type', () => {
      expect(getSocketMessageKey(326488)).toEqual('item');
    });
    it('should return item if id is interactive message type', () => {
      expect(getSocketMessageKey(34481717293)).toEqual('item');
    });

    it('should return undefined if id is not existed in map type', () => {
      expect(getSocketMessageKey(999)).toEqual(undefined);
    });
  });
});
