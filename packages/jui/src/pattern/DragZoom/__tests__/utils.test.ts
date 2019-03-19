/*
 * @Author: Paynter Chen
 * @Date: 2019-03-18 13:20:11
 * Copyright © RingCentral. All rights reserved.
 */
import { ElementRect } from '../../../components/ZoomArea';
import { Padding } from '../types';
import { calculateFitSize, fixOffset, isDraggable } from '../utils';

describe('utils', () => {
  const createRect = (
    width: number,
    height: number,
    left?: number,
    top?: number,
  ): ElementRect => {
    return {
      width,
      height,
      left: left ? left : 0,
      top: top ? top : 0,
    };
  };
  const createPadding = (leftRight: number, topBottom: number): Padding => {
    return [leftRight, topBottom, leftRight, topBottom];
  };
  describe('calculateFitSize()', () => {
    it('should fit by longer side', () => {
      const result = calculateFitSize(
        createRect(100, 100),
        createRect(100, 200),
        createPadding(0, 0),
        0,
      );
      expect(result).toEqual(createRect(50, 100, 25, 0));
    });
    it('should fit by longer side with padding', () => {
      const result = calculateFitSize(
        createRect(100, 100),
        createRect(100, 200),
        createPadding(20, 20),
        0,
      );
      expect(result).toEqual(createRect(30, 60, 35, 20));
    });

    it('should leave contentRect min size', () => {
      const result = calculateFitSize(
        createRect(100, 100),
        createRect(100, 200),
        createPadding(20, 20),
        70,
      );
      expect(result).toEqual(createRect(35, 70, 32.5, 15));
    });
  });
  describe('fixOffset()', () => {
    it('should not offset when content is not bigger than container', () => {
      const result = fixOffset(10, 100, 200);
      expect(result).toEqual(0);
    });
    it('should fix offset', () => {
      const result = fixOffset(5, 100, 90);
      expect(result).toEqual(5);
    });

    it('should fix offset', () => {
      const result = fixOffset(-15, 100, 90);
      expect(result).toEqual(-5);
    });

    it('should not fix offset', () => {
      const result = fixOffset(2, 100, 90);
      expect(result).toEqual(2);
    });
  });
  describe('isDraggable()', () => {
    it('should isDraggable == true', () => {
      const result = isDraggable(100, 200, createRect(100, 100));
      expect(result).toBeTruthy();
    });
    it('should isDraggable == false', () => {
      const result = isDraggable(100, 50, createRect(100, 100));
      expect(result).toBeFalsy();
    });
  });
});
