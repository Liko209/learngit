/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-05 14:06:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Utils } from '../Utils';

describe('Utils', () => {
  describe('isValidVolume()', () => {
    it('should return true when volume is valid', () => {
      const isValidVolume = Utils.isValidVolume;
      expect(isValidVolume(0)).toBeTruthy();
      expect(isValidVolume(1)).toBeTruthy();
      expect(isValidVolume(0.5)).toBeTruthy();
      expect(isValidVolume(0.1)).toBeTruthy();
      expect(isValidVolume(0.602)).toBeTruthy();
    });
    it('should return false when volume is inValid', () => {
      const isValidVolume = Utils.isValidVolume;
      expect(isValidVolume(2)).toBeFalsy();
      expect(isValidVolume(-0.11)).toBeFalsy();
      expect(isValidVolume(1.602)).toBeFalsy();
    });
  });
  describe('difference()', () => {
    it('should return diff', () => {
      const arr1 = ['a', 'b', 'c'];
      const arr2 = ['c', 'd', 'a'];
      expect(Utils.difference(arr1, arr2)).toEqual(['b', 'd']);
      const arr3 = ['1', 'b', 'c'];
      const arr4 = ['c', 'd', '4'];
      expect(Utils.difference(arr3, arr4)).toEqual(['1', 'b', 'd', '4']);
      const arr5: string[] = [];
      const arr6 = ['c', 'd'];
      expect(Utils.difference(arr5, arr6)).toEqual(arr6);
    });
  });
  describe('formatMediaId()', () => {
    it('should return formated id with description', () => {
      const trackId = 'trackId';
      const mediaId = 'media100';
      const description = 'desc';
      const formatMediaId = Utils.formatMediaId({
        trackId,
        mediaId,
        description,
      });
      expect(formatMediaId).toEqual(
        `[${trackId}]-[${mediaId}]-[${description}]`,
      );
    });
    it('should return formated id without description', () => {
      const trackId = 'trackId';
      const mediaId = 'media100';
      const formatMediaId = Utils.formatMediaId({
        trackId,
        mediaId,
      });
      expect(formatMediaId).toEqual(`[${trackId}]-[${mediaId}]`);
    });
    it('should return formated id with invalid symbol', () => {
      const trackId = '_tra¥ckI—d';
      const mediaId = 'me_dia%10+0';
      const description = '+d_e#sc';
      expect(() => {
        Utils.formatMediaId({
          trackId,
          mediaId,
          description,
        });
      }).toThrow();
    });
  });
  describe('dismantleMediaId()', () => {
    it('should return media ids object', () => {
      const trackId = 'trackId';
      const mediaId = 'media100';
      const description = 'desc';
      const mediaIds = `[${trackId}]-[${mediaId}]-[${description}]`;

      const mediaObj = Utils.dismantleMediaId(mediaIds);
      expect(mediaObj.trackId).toEqual(trackId);
      expect(mediaObj.mediaId).toEqual(mediaId);
      expect(mediaObj.description).toEqual(description);
    });
    it('should return formated id with invalid symbol', () => {
      const trackId = '_tra¥ckI—d';
      const mediaId = 'me_dia%10+0';
      const description = '+d_e#sc';
      const mediaIds = `[${trackId}]-[${mediaId}]-[${description}]`;

      const mediaObj = Utils.dismantleMediaId(mediaIds);
      expect(mediaObj.trackId).toEqual('');
      expect(mediaObj.mediaId).toEqual('');
      expect(mediaObj.description).toEqual('');
    });
  });
});
