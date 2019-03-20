/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:27:17
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '../../store/models/FileItem';
import { getThumbnailURL, getMaxThumbnailURLInfo } from '../getThumbnailURL';

describe('getThumbnailURL', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const defaultURL = 'http://a.com';

  it('should get empty url when file item has no versions', () => {
    const model: FileItemModel = { versions: [] } as FileItemModel;
    expect(getThumbnailURL(model)).toBe('');
  });

  it('should get version 0 url from file item', () => {
    const stored_file_id = 123;
    const thumbKey = `${stored_file_id}size=1000x200`;
    const thumbnailURL = defaultURL;
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
    };
    const version1 = {};
    const model: FileItemModel = {
      versions: [version0, version1],
    } as FileItemModel;
    expect(getThumbnailURL(model)).toBe(thumbnailURL);
  });
  it('should get empty url when versions has no thumbs filed', () => {
    const stored_file_id = 123;
    const version0 = {
      stored_file_id,
    };
    const version1 = {};
    const model: FileItemModel = {
      versions: [version0, version1],
    } as FileItemModel;
    expect(getThumbnailURL(model)).toBe('');
  });
});

describe('getMaxThumbnailURLInfo', () => {
  it('should get max thumbnail', () => {
    const model = {
      storeFileId: 1208836108,
      thumbs: {
        '1208836108size=1000x200': 'url1',
        '1208836108size=360x272': 'url2',
        'width-1208836108size=1000x200': 265,
        'height-1208836108size=1000x200': '200',
        'width-1208836108size=360x272': 360,
        'height-1208836108size=360x272': '272',
      },
    };
    const info = getMaxThumbnailURLInfo(model as FileItemModel);
    expect(info.url).toEqual('url2');
    expect(info.width).toEqual(360);
    expect(info.height).toEqual(272);
  });
  it('should get max thumbnail if there has a origin size thumbnail', () => {
    const model = {
      storeFileId: 1208836108,
      origWidth: 666,
      origHeight: 666,
      thumbs: {
        1208836108: 'url-origin',
        '1208836108size=1000x200': 'url1',
        '1208836108size=360x272': 'url2',
        'width-1208836108size=1000x200': 265,
        'height-1208836108size=1000x200': '200',
        'width-1208836108size=360x272': 360,
        'height-1208836108size=360x272': '272',
      },
    };
    const info = getMaxThumbnailURLInfo(model as FileItemModel);
    expect(info.url).toEqual('url-origin');
    expect(info.width).toEqual(666);
    expect(info.height).toEqual(666);
  });
  it('should get empty url when thumbnail not exist', () => {
    const model = {
      storeFileId: 1208836108,
    };
    const info = getMaxThumbnailURLInfo(model as FileItemModel);
    expect(info.url).toEqual('');
    expect(info.width).toEqual(0);
    expect(info.height).toEqual(0);
  });
  it('should get empty url when storeFileId not exist', () => {
    const model = {
      thumbs: {},
    };
    const info = getMaxThumbnailURLInfo(model as FileItemModel);
    expect(info.url).toEqual('');
    expect(info.width).toEqual(0);
    expect(info.height).toEqual(0);
  });
});
