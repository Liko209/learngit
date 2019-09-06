/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-13 15:15:05
 * Copyright © RingCentral. All rights reserved.
 */

import {
  getSocketMessageKey,
  parseSocketData,
  parseSocketMessage,
} from '../index';

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

  describe('parseSocketData', () => {
    it('should return correct data when we support that channel', () => {
      expect(parseSocketData('typing', '{}')).not.toBeUndefined();
    });

    it('should return undefined if we has not supported that channel', () => {
      expect(parseSocketData('message_one', '{}')).toBeUndefined();
    });
  });

  describe('parseSocketMessage', () => {
    it('should return force logout when message contain force_logout and instance_id is undefined', () => {
      expect(
        parseSocketMessage('{"body":{"objects":[[{"force_logout":true}]]}}'),
      ).toEqual({ logout: true });
    });

    it('should not return force logout when message contain force_logout and instance_id is not undefined', () => {
      expect(
        parseSocketMessage(
          '{"body":{"objects":[[{"force_logout":true, "instance_id":123}]]}}',
        ),
      ).toEqual({});
    });
  });
});
