/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 21:38:44
 * Copyright © RingCentral. All rights reserved.
 */
import { FileItemUtils } from '../FileItemUtils';
import {
  GifFileExtensions,
  ImageFileExtensions,
  ResizableExtensions,
  SupportPreviewImageExtensions,
} from '../ImageFileExtensions';

describe('FileItemUtils', () => {
  describe('filterType', () => {
    it('should get type', () => {
      const type = 'a';
      expect(FileItemUtils.filterType({ type })).toEqual(type);
    });

    it('should filter image type', () => {
      const type = 'image/jpeg';
      expect(FileItemUtils.filterType({ type })).toEqual('jpeg');
    });
  });
  describe('isSupportPreview', () => {
    it('should return true when is support preview', () => {
      SupportPreviewImageExtensions.forEach((element: string) => {
        expect(FileItemUtils.isSupportPreview({ type: element })).toBeTruthy();
      });
    });

    it('should return false when is not gif', () => {
      expect(FileItemUtils.isSupportPreview({ type: 'gg' })).toBeFalsy();
    });
  });

  describe('isImageResizable', () => {
    it('should return true when is support resize', () => {
      ResizableExtensions.forEach((element: string) => {
        expect(FileItemUtils.isImageResizable({ type: element })).toBeTruthy();
      });
    });

    it('should return false when is not support resize', () => {
      expect(FileItemUtils.isImageResizable({ type: 'gg' })).toBeFalsy();
    });
  });

  describe('isGifItem', () => {
    const itemA = { type: 'pc' };
    const itemB = { type: 'gif' };
    it('should return true when is gif', () => {
      expect(FileItemUtils.isGifItem(itemA)).toBeFalsy();
    });

    it('should return false when is not gif', () => {
      expect(FileItemUtils.isGifItem(itemB)).toBeTruthy();
    });
  });

  describe('isImageItem', () => {
    const itemA = { type: 'pc' };
    const itemB = { type: 'jpg' };
    const itemC = { type: 'image/jpg' };

    it('should return false when is not image', () => {
      expect(FileItemUtils.isImageItem(itemA)).toBeFalsy();
    });

    it('should return true when is image', () => {
      expect(FileItemUtils.isImageItem(itemB)).toBeTruthy();
    });

    it('should return true when type is mime and include is image', () => {
      expect(FileItemUtils.isImageItem(itemC)).toBeTruthy();
    });

    it('[JPT-1100] Image should be listed under Image tab', () => {
      const images = [
        'tif',
        'tiff',
        'ai',
        'psd',
        'bmp',
        'jpg',
        'jpeg',
        'png',
        'gif',
      ];
      images.forEach((type: string) => {
        expect(FileItemUtils.isImageItem({ type })).toBeTruthy();
      });
    });
  });

  describe('getUrl', () => {
    const itemA = {
      versions: [{ url: 'baaa.com' }],
    };

    const itemB = {
      versions: [],
    };

    it('should return url when has it in versions', () => {
      expect(FileItemUtils.getUrl(itemA)).toBe('baaa.com');
    });

    it('should return empty when dont have', () => {
      expect(FileItemUtils.getUrl(itemB)).toBe('');
    });
  });

  describe('getDownloadUrl', () => {
    const itemA = {
      versions: [{ download_url: 'a.com' }],
    };

    const itemB = {
      versions: [],
    };

    const itemC = {
      versions: [],
      url: 'c.com',
    };

    it('should return download url when has it in versions', () => {
      expect(FileItemUtils.getDownloadUrl(itemA)).toBe('a.com');
    });

    it('should return empty when dont have', () => {
      expect(FileItemUtils.getDownloadUrl(itemB)).toBe('');
    });

    it('should return url when dont have versions but has url ', () => {
      expect(FileItemUtils.getDownloadUrl(itemC)).toBe('c.com');
    });
  });

  describe('getStorageId', () => {
    const itemA = {
      versions: [{ stored_file_id: 1 }],
    };

    const itemB = {
      versions: [],
    };

    it('should return storage id', () => {
      expect(FileItemUtils.getStorageId(itemA)).toBe(1);
    });

    it('should return 0', () => {
      expect(FileItemUtils.getStorageId(itemB)).toBe(0);
    });
  });

  describe('isFromGiphy', () => {
    const itemA = {
      source: 'giphy',
    };
    const itemB = {
      source: 'upload',
    };
    it('should return true when is from giphy', () => {
      expect(FileItemUtils.isFromGiphy(itemA)).toBeTruthy();
    });

    it('should return false when is not from giphy', () => {
      expect(FileItemUtils.isFromGiphy(itemB)).toBeFalsy();
    });
  });

  describe('getVersionDate', () => {
    it('should return date at 0 pos when has version data ', () => {
      expect(
        FileItemUtils.getVersionDate({
          versions: [{ date: 11111 }, { date: 22222 }] as any,
        }),
      ).toBe(11111);
    });

    it('should return null when version data is string ', () => {
      expect(
        FileItemUtils.getVersionDate({
          versions: [{ date: '11111' }, { date: '22222' }] as any,
        }),
      ).toBe(null);
    });

    it('should return null when version is empty ', () => {
      expect(FileItemUtils.getVersionDate({ versions: [] as any })).toBe(null);
    });

    it('should return null when version is not array ', () => {
      expect(FileItemUtils.getVersionDate({ versions: {} as any })).toBe(null);
    });
  });
});
