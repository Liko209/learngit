/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 16:56:02
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '../FileItem';
describe('FileItemModel', () => {
  describe('new FileItem', () => {
    const fileItemModel = FileItemModel.fromJS({
      type: 'type',
      name: 'name',
      is_new: true,
      is_document: true,
      deactivated: true,
      versions: [],
    } as any);
    expect(fileItemModel.type).toBe('type');
    expect(fileItemModel.name).toBe('name');
    expect(fileItemModel.isNew).toBe(true);
    expect(fileItemModel.deactivated).toBe(true);
    expect(fileItemModel.isDocument).toBe(true);
    expect(fileItemModel.versions).toEqual([]);
  });
  describe('hasVersions()', () => {
    it('should return true if has versions', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [{}],
      });
      expect(fileItemModel.hasVersions()).toBeTruthy();
    });
  });

  describe('get thumbs', () => {
    it('should return thumbs if thumbs exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            thumbs: {},
          },
        ],
      } as any);
      expect(fileItemModel.thumbs).toEqual({});
    });

    it('should return undefined if thumbs not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [{}],
      } as any);
      expect(fileItemModel.thumbs).toBeUndefined();
    });

    it('should return undefined if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.thumbs).toBeUndefined();
    });
  });

  describe('get pages', () => {
    it('should return pages if pages exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            pages: [{}],
          },
        ],
      } as any);
      expect(fileItemModel.pages).toEqual([{}]);
    });

    it('should return [] if pages not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [{}],
      } as any);
      expect(fileItemModel.pages).toEqual([]);
    });
    it('should return [] if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.pages).toEqual([]);
    });
  });

  describe('get versionUrl', () => {
    it('should return url if latestVersion.url exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            url: '123',
          },
        ],
      } as any);
      expect(fileItemModel.versionUrl).toBe('123');
    });

    it('should return empty string if latestVersion.url not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.versionUrl).toEqual('');
    });
    it('should return empty string if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.versionUrl).toEqual('');
    });
  });

  describe('get size', () => {
    it('should return size if latestVersion.size exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            size: '123',
          },
        ],
      } as any);
      expect(fileItemModel.size).toBe('123');
    });

    it('should return 0 if latestVersion.size not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.size).toEqual(0);
    });
    it('should return 0 if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.size).toEqual(0);
    });
  });

  describe('get downloadUrl', () => {
    it('should return downloadUrl if latestVersion.size exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            download_url: '123',
          },
        ],
      } as any);
      expect(fileItemModel.downloadUrl).toBe('123');
    });

    it('should return empty string if latestVersion.downloadUrl not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.downloadUrl).toEqual('');
    });
    it('should return empty string if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.downloadUrl).toEqual('');
    });
  });

  describe('get origHeight', () => {
    it('should return downloadUrl if latestVersion.origHeight exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            orig_height: 123,
          },
        ],
      } as any);
      expect(fileItemModel.origHeight).toBe(123);
    });

    it('should return 0 if latestVersion.origHeight not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.origHeight).toEqual(0);
    });
    it('should return 0 if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.origHeight).toEqual(0);
    });
  });

  describe('get origWidth', () => {
    it('should return origWidth if latestVersion.origWidth exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            orig_width: 123,
          },
        ],
      } as any);
      expect(fileItemModel.origWidth).toBe(123);
    });

    it('should return 0 if latestVersion.origWidth not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.origWidth).toEqual(0);
    });
    it('should return 0 if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.origWidth).toEqual(0);
    });
  });

  describe('latestVersion', () => {
    const v1 = { deactivated: true };
    const v2 = { deactivated: true };
    const v3 = { deactivated: false };
    const fileItemModel = FileItemModel.fromJS({
      id: 1,
      versions: [v1, v2, v3],
    } as any);
    it('should return first undeactivated version', () => {
      expect(fileItemModel.latestVersion).toEqual(v3);
    });
  });
});
