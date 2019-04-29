/*
 * @Author: isaac.liu
 * @Date: 2019-01-26 15:09:37
 * Copyright © RingCentral. All rights reserved.
 */
import {
  getThumbnailForSquareSize,
  getThumbnailSize,
} from '../calculateImageSize';

describe('calculateImageSize', () => {
  describe('getThumbnailSize()', () => {
    it('should match case1', () => {
      const { width, height } = getThumbnailSize(175, 70);
      expect(width).toEqual(180);
      expect(height).toEqual(72);
    });

    it('should match case2 when width > height', () => {
      const { width, height } = getThumbnailSize(160, 90);
      expect(width).toEqual(180);
      expect(height).toEqual(101);
    });

    it('should match case2 when width < height', () => {
      const { width, height } = getThumbnailSize(160, 300);
      expect(width).toEqual(180);
      expect(height).toEqual(338);
    });

    it('should match case3 with unchanged size', () => {
      const { width, height } = getThumbnailSize(200, 187);
      expect(width).toEqual(200);
      expect(height).toEqual(187);
    });

    it('should match case4 when width < height', () => {
      const { width, height } = getThumbnailSize(400, 700);
      expect(width).toEqual(206);
      expect(height).toEqual(360);
    });

    it('should match case4 when width > height', () => {
      const { width, height } = getThumbnailSize(700, 400);
      expect(width).toEqual(360);
      expect(height).toEqual(206);
    });

    it('should match case5', () => {
      const { width, height } = getThumbnailSize(700, 10);
      expect(width).toEqual(360);
      expect(height).toEqual(72);
    });

    it('should match case6', () => {
      const { width, height } = getThumbnailSize(10, 70);
      expect(width).toEqual(180);
      expect(height).toEqual(360);
    });
  });

  describe('getThumbnailForSquareSize()', () => {
    const size = 180;
    it('should fit to size when width < height', () => {
      const { width, height, justifyHeight, top } = getThumbnailForSquareSize(
        200,
        300,
        size,
      );
      expect(width).toEqual(size);
      expect(height).toEqual(size);
      expect(justifyHeight).toEqual(true);
      expect(top).toEqual(-45);
    });

    it('should fit to size when width > height', () => {
      const { width, height, justifyWidth, left } = getThumbnailForSquareSize(
        300,
        200,
        size,
      );
      expect(width).toEqual(size);
      expect(height).toEqual(size);
      expect(justifyWidth).toEqual(true);
      expect(left).toEqual(-45);
    });
  });
});
