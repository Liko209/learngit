/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-22 15:24:59
 * Copyright © RingCentral. All rights reserved.
 */
import { NotificationUtils } from '../NotificationUtils';

describe('NotificationUtils', () => {
  const nameSpace = 'ns';
  const moduleA = 'm1';
  const moduleB = 'm2';
  const moduleC = 'm3';

  const keyA = 'k1';
  const keyB = 'k2';
  const keyC = 'k3';
  let utils: NotificationUtils;

  beforeEach(() => {
    utils = new NotificationUtils();
  });

  describe('on', () => {
    it('should be able to add element to the list', () => {
      expect(utils.getSize()).toBe(0);
      utils.on(moduleA, keyA);
      expect(utils.getSize()).toBe(1);
    });
  });

  describe('off', () => {
    it('should be able to remove element from the list', () => {
      expect(utils.getSize()).toBe(0);
      utils.on(moduleA, keyA);
      expect(utils.getSize()).toBe(1);
      utils.off(moduleA, keyA);
      expect(utils.getSize()).toBe(0);
    });
    it('should not remove element when it is not in the list', () => {
      expect(utils.getSize()).toBe(0);
      utils.on(moduleB, keyB);
      expect(utils.getSize()).toBe(1);
      utils.off(moduleA, keyA);
      expect(utils.getSize()).toBe(1);
      utils.off(moduleB, keyA);
      expect(utils.getSize()).toBe(1);
    });
  });

  describe('isExactMatch', () => {
    it('should not match when nothing is in the list', () => {
      expect(utils.isExactMatch(moduleA, keyA)).toBe(false);
    });
    it('should match when list is not empty', () => {
      utils.on(moduleA, keyA);
      utils.on(moduleB, keyB);
      utils.on(moduleC, keyC);
      expect(utils.isExactMatch(moduleC, keyC)).toBe(true);
    });
    it('should not match when the element is not added', () => {
      utils.on(moduleA, keyA);
      utils.on(moduleB, keyB);
      expect(utils.isExactMatch(moduleC, keyC)).toBe(false);
    });
  });
  describe('isPartialMatch', () => {
    it('should not match when the list is empty', () => {
      expect(utils.isPartialMatch(moduleA)).toBe(false);
    });
    it('should match when the prefix is same as the element in list', () => {
      utils.on(moduleA, keyA);
      utils.on(moduleB, keyB);
      utils.on(moduleC, keyC);
      expect(utils.isPartialMatch(moduleA)).toBe(true);
    });
    it('should not match when the list is empty', () => {
      utils.on(moduleA, keyA);
      utils.on(moduleB, keyB);
      utils.on(moduleC, keyC);
      expect(utils.isPartialMatch('test.a')).toBe(false);
    });
  });
});
