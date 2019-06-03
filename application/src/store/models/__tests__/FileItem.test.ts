/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-11 16:56:02
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '../FileItem';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader } from 'sdk/module/serviceLoader';
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

    it('should return null if thumbs not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [{}],
      } as any);
      expect(fileItemModel.thumbs).toBeNull();
    });

    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.thumbs).toBeNull();
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

    it('should return null if pages not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [{}],
      } as any);
      expect(fileItemModel.pages).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.pages).toBeNull();
    });
  });

  describe('get versionUrl', () => {
    it('should return url if versions[0].url exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            url: '123',
          },
        ],
      } as any);
      expect(fileItemModel.versionUrl).toBe('123');
    });

    it('should return null if versions[0].url not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.versionUrl).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.versionUrl).toBeNull();
    });
  });

  describe('get size', () => {
    it('should return size if versions[0].size exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            size: '123',
          },
        ],
      } as any);
      expect(fileItemModel.size).toBe('123');
    });

    it('should return null if versions[0].size not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.size).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.size).toBeNull();
    });
  });

  describe('get downloadUrl', () => {
    it('should return downloadUrl if versions[0].size exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            download_url: '123',
          },
        ],
      } as any);
      expect(fileItemModel.downloadUrl).toBe('123');
    });

    it('should return null if versions[0].downloadUrl not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.downloadUrl).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.downloadUrl).toBeNull();
    });
  });

  describe('get origHeight', () => {
    it('should return downloadUrl if versions[0].origHeight exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            orig_height: 123,
          },
        ],
      } as any);
      expect(fileItemModel.origHeight).toBe(123);
    });

    it('should return null if versions[0].origHeight not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.origHeight).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.origHeight).toBeNull();
    });
  });

  describe('get origWidth', () => {
    it('should return origWidth if versions[0].origWidth exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            orig_width: 123,
          },
        ],
      } as any);
      expect(fileItemModel.origWidth).toBe(123);
    });

    it('should return null if versions[0].origWidth not exist', () => {
      const fileItemModel = FileItemModel.fromJS({
        id: 1,
        versions: [{}],
      } as any);
      expect(fileItemModel.origWidth).toBeNull();
    });
    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.origWidth).toBeNull();
    });
  });

  describe('canDeleteFile()', () => {
    beforeEach(() => {
      const mockAccountService = ({
        userConfig: {
          getGlipUserId: jest.fn().mockReturnValue(1),
        },
      } as any) as AccountService;
      ServiceLoader.getInstance = jest.fn().mockReturnValue(mockAccountService);
    });
    it('should return false when currentUserId is not creatorId', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            creator_id: 2,
          },
        ],
      } as any);
      expect(fileItemModel.canDeleteFile).toBeFalsy();
    });

    it('should return true when currentUserId is creatorId', () => {
      const fileItemModel = FileItemModel.fromJS({
        versions: [
          {
            creator_id: 1,
          },
        ],
      } as any);
      expect(fileItemModel.canDeleteFile).toBeTruthy();
    });

    it('should return null if versions not exist', () => {
      const fileItemModel = FileItemModel.fromJS({} as any);
      expect(fileItemModel.canDeleteFile).toBeNull();
    });
  });
});
