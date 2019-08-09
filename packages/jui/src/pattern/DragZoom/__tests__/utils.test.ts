/*
 * @Author: Paynter Chen
 * @Date: 2019-03-18 13:20:11
 * Copyright © RingCentral. All rights reserved.
 */
import { Padding } from '../types';
import {
  calculateFitWidthHeight,
  fixOffset,
  isDraggable,
  calculateFitWidthHeightByFixedContainer,
} from '../utils';

describe('utils', () => {
  const createPadding = (leftRight: number, topBottom: number): Padding => {
    return [leftRight, topBottom, leftRight, topBottom];
  };
  describe('calculateFitWidthHeight()', () => {
    it('should fit by longer side', () => {
      const result = calculateFitWidthHeight(
        100,
        200,
        100,
        100,
        createPadding(0, 0),
        0,
      );
      expect(result).toEqual([50, 100]);
    });
    it('should fit by longer side with padding', () => {
      const result = calculateFitWidthHeight(
        100,
        200,
        100,
        100,
        createPadding(20, 20),
        0,
      );
      expect(result).toEqual([30, 60]);
    });

    it('should leave contentRect min size', () => {
      const result = calculateFitWidthHeight(
        100,
        200,
        100,
        100,
        createPadding(20, 20),
        70,
      );
      expect(result).toEqual([35, 70]);
    });
  });
  describe('fixOffset()', () => {
    it('should not offset when content is not bigger than container', () => {
      const result = fixOffset(10, 100, 200);
      expect(result).toEqual(0);
    });
    it('should fix offset while offset set to 5', () => {
      const result = fixOffset(5, 100, 90);
      expect(result).toEqual(5);
    });

    it('should fix offset while offset set to -15', () => {
      const result = fixOffset(-15, 100, 90);
      expect(result).toEqual(-5);
    });

    it('should not fix offset', () => {
      const result = fixOffset(2, 100, 90);
      expect(result).toEqual(2);
    });
  });
  describe('calculateFitWidthHeightByFixedContainer()', () => {
    it('should return [280, 400] when call with 140, 200', () => {
      const result = calculateFitWidthHeightByFixedContainer(140, 200, 280);
      expect(result).toEqual([280, 400]);
    });
    it('should return [500, 280] when call with 1000, 560', () => {
      const result = calculateFitWidthHeightByFixedContainer(1000, 560, 280);
      expect(result).toEqual([500, 280]);
    });
  });

  describe('isDraggable()', () => {
    it('should isDraggable == true', () => {
      const result = isDraggable(100, 200, 100, 100);
      expect(result).toBeTruthy();
    });
    it('should isDraggable == false', () => {
      const result = isDraggable(100, 50, 100, 100);
      expect(result).toBeFalsy();
    });
  });
});
