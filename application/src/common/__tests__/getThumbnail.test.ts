/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-29 16:36:50
 * Copyright © RingCentral. All rights reserved.
 */

import { generateModifiedImageURL, RULE } from '../generateModifiedImageURL';
import { ServiceLoader } from 'sdk/module/serviceLoader';
const url = 'URL';
const id = 1;

const itemService = {
  getThumbsUrlWithSize: jest.fn().mockResolvedValue(url),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);

describe('generateModifiedImageURL', () => {
  describe('cut out to a square', () => {
    const rule = RULE.SQUARE_IMAGE;
    it('should be a 36x36 pixel square size when image size equal ratio and use default square size', async () => {
      const origWidth = 1000;
      const origHeight = 1000;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
      });
      expect(result).toEqual({
        url,
        width: 36,
        height: 36,
        top: 0,
        left: 0,
        justifyWidth: true,
        justifyHeight: false,
        imageHeight: 1000,
        imageWidth: 1000,
      });
    });

    it('should be a 180x180 pixel square size when image size equal ratio and use custom square size', async () => {
      const origWidth = 1000;
      const origHeight = 1000;
      const squareSize = 180;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
        squareSize,
      });
      expect(result).toEqual({
        url,
        width: squareSize,
        height: squareSize,
        top: 0,
        left: 0,
        justifyWidth: true,
        justifyHeight: false,
        imageHeight: 1000,
        imageWidth: 1000,
      });
    });

    it('should be a 72x36 pixel square size when image size not equal ratio and use default square size', async () => {
      const origWidth = 1000;
      const origHeight = 500;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
      });
      expect(result).toEqual({
        url,
        width: 36,
        height: 36,
        top: 0,
        left: -18,
        justifyWidth: true,
        justifyHeight: false,
        imageHeight: 500,
        imageWidth: 1000,
      });
    });

    it('should be a 180x360 pixel square size when image size not equal ratio and use custom square size', async () => {
      const origWidth = 500;
      const origHeight = 1000;
      const squareSize = 180;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
        squareSize,
      });
      expect(result).toEqual({
        url,
        width: squareSize,
        height: squareSize,
        top: -90,
        left: 0,
        justifyWidth: false,
        justifyHeight: true,
        imageHeight: 1000,
        imageWidth: 500,
      });
    });
  });

  describe('cut out to a rectangle', () => {
    const rule = RULE.RECTANGLE_IMAGE;

    it('should be a 360x360 pixel square size when image size equal ratio', async () => {
      const origWidth = 1000;
      const origHeight = 1000;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
      });
      expect(result).toEqual({
        url,
        width: 360,
        height: 360,
        top: 0,
        left: 0,
        justifyWidth: true,
        justifyHeight: false,
        imageHeight: 360,
        imageWidth: 360,
      });
    });

    it('should be a 360x180 pixel square size when image width greater than height', async () => {
      const origWidth = 1000;
      const origHeight = 500;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
      });
      expect(result).toEqual({
        url,
        width: 360,
        height: 180,
        top: 0,
        left: 0,
        justifyWidth: true,
        justifyHeight: false,
        imageHeight: 180,
        imageWidth: 360,
      });
    });

    it('should be a 180x360 pixel square size when image height greater than width', async () => {
      const origWidth = 500;
      const origHeight = 1000;
      const result = await generateModifiedImageURL({
        id,
        origWidth,
        origHeight,
        rule,
      });
      expect(result).toEqual({
        url,
        width: 180,
        height: 360,
        top: 0,
        left: 0,
        justifyWidth: false,
        justifyHeight: true,
        imageHeight: 360,
        imageWidth: 180,
      });
    });
  });
});
