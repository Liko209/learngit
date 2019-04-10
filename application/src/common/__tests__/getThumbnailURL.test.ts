/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:27:17
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '../../store/models/FileItem';
import {
  getThumbnailURL,
  getMaxThumbnailURLInfo,
  getThumbnailURLWithType,
  ImageInfo,
  IMAGE_TYPE,
  SQUARE_SIZE,
} from '../getThumbnailURL';
import { getThumbnailSize } from 'jui/foundation/utils';
import { ItemService } from 'sdk/module/item/service';
import { RULE } from '@/common/generateModifiedImageURL';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('jui/foundation/utils');

describe('getThumbnailURL', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const defaultURL = 'http://a.com';

  it('should get empty url when file item has no versions', () => {
    const model: ImageInfo = {
      id: 1,
      type: '',
      versionUrl: '',
      versions: [],
    } as ImageInfo;
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
    const model: ImageInfo = {
      versions: [version0, version1],
    } as ImageInfo;
    expect(getThumbnailURL(model)).toBe(thumbnailURL);
  });
  it('should get empty url when versions has no thumbs filed', () => {
    const stored_file_id = 123;
    const version0 = {
      stored_file_id,
    };
    const version1 = {};
    const model: ImageInfo = {
      versions: [version0, version1],
    } as ImageInfo;
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

describe('getThumbnailURLWithType', () => {
  let rule: RULE;
  const defaultModel: ImageInfo = {
    id: 1,
    versions: [],
    versionUrl: 'http://a.com',
    type: 'aaa',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    FileItemUtils.isGifItem = jest.fn().mockReturnValue(false);
    FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(true);
  });

  it('should just return unknown image type and empty url when id< 0', async () => {
    const item = {
      id: -10,
      type: 'type',
      versionUrl: 'versionUrl',
      versions: [],
    };
    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(item, rule);
    expect(result.url).toEqual('');
    expect(result.type).toEqual(IMAGE_TYPE.UNKNOWN_IMAGE);
  });

  it('should get empty url with unknown type when item without type', async () => {
    const model = Object.assign({}, defaultModel, { type: '' });
    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual('');
  });

  it('should get original url with original type when item is gif item', async () => {
    rule = RULE.RECTANGLE_IMAGE;
    FileItemUtils.isGifItem = jest.fn().mockReturnValue(true);
    const result = await getThumbnailURLWithType(defaultModel, rule);
    expect(result.url).toEqual('http://a.com');
    expect(result.type).toEqual(IMAGE_TYPE.ORIGINAL_IMAGE);
  });

  it('should get thumbnail url with thumbnail type when item rule is square image and can match the versions url', async () => {
    const stored_file_id = 123;
    const thumbKey = `${stored_file_id}size=${SQUARE_SIZE}x${SQUARE_SIZE}`;
    const thumbnailURL = 'http://b.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, { versions: [version0] });

    rule = RULE.SQUARE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual(thumbnailURL);
    expect(result.type).toEqual(IMAGE_TYPE.THUMBNAIL_IMAGE);
  });

  it('should get modify url with modify type when item rule is square image and cannot match the versions url', async () => {
    const stored_file_id = 123;
    const thumbKey = `${stored_file_id}size=1000x200`;
    const thumbnailURL = 'http://b.com';
    const modifyURL = 'http://c.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, { versions: [version0] });
    const getThumbsUrlWithSize = jest.fn().mockReturnValue(modifyURL);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(() => ({
      getThumbsUrlWithSize,
    }));

    rule = RULE.SQUARE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual(modifyURL);
    expect(result.type).toEqual(IMAGE_TYPE.MODIFY_IMAGE);
  });

  it('should get thumbnail url with thumbnail type when item rule is rectangle image and can match the versions url', async () => {
    const stored_file_id = 123;
    const origWidth = 200;
    const origHeight = 1000;
    const thumbKey = `${stored_file_id}size=${origWidth}x${origHeight}`;
    const thumbnailURL = 'http://b.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      orig_height: origHeight,
      orig_width: origWidth,
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, { versions: [version0] });

    (getThumbnailSize as jest.Mock).mockReturnValue({
      imageWidth: origWidth,
      imageHeight: origHeight,
    });

    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual(thumbnailURL);
    expect(result.type).toEqual(IMAGE_TYPE.THUMBNAIL_IMAGE);
  });

  it('should get modify url with modify type when item rule is rectangle image and cannot match the versions url', async () => {
    const stored_file_id = 123;
    const origWidth = 200;
    const origHeight = 1000;
    const thumbKey = `${stored_file_id}size=180x200`;
    const thumbnailURL = 'http://b.com';
    const modifyURL = 'http://c.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      orig_height: origHeight,
      orig_width: origWidth,
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, { versions: [version0] });
    (getThumbnailSize as jest.Mock).mockReturnValue({
      imageWidth: origWidth,
      imageHeight: origHeight,
    });
    const getThumbsUrlWithSize = jest.fn().mockReturnValue(modifyURL);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(() => ({
      getThumbsUrlWithSize,
    }));

    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual(modifyURL);
    expect(result.type).toEqual(IMAGE_TYPE.MODIFY_IMAGE);
  });

  it('should get original url with original type when item rule is rectangle image and cannot get original width or height', async () => {
    const stored_file_id = 123;
    const origWidth = null;
    const origHeight = null;
    const thumbKey = `${stored_file_id}size=180x200`;
    const thumbnailURL = 'http://b.com';
    const modifyURL = 'http://c.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      orig_height: origHeight,
      orig_width: origWidth,
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, { versions: [version0] });
    (getThumbnailSize as jest.Mock).mockReturnValue({
      imageWidth: origWidth,
      imageHeight: origHeight,
    });
    const getThumbsUrlWithSize = jest.fn().mockReturnValue(modifyURL);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(() => ({
      getThumbsUrlWithSize,
    }));

    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual(model.versionUrl);
    expect(result.type).toEqual(IMAGE_TYPE.ORIGINAL_IMAGE);
  });

  it('should get empty url with unknown type when all conditions cannot match', async () => {
    const stored_file_id = 123;
    const origWidth = null;
    const origHeight = null;
    const thumbKey = `${stored_file_id}size=180x200`;
    const thumbnailURL = 'http://b.com';
    const modifyURL = 'http://c.com';
    const version0 = {
      stored_file_id,
      thumbs: {
        [thumbKey]: thumbnailURL,
      },
      orig_height: origHeight,
      orig_width: origWidth,
      download_url: '',
      url: '',
      size: 0,
    };
    const model = Object.assign({}, defaultModel, {
      versions: [version0],
      versionUrl: null,
    });
    (getThumbnailSize as jest.Mock).mockReturnValue({
      imageWidth: origWidth,
      imageHeight: origHeight,
    });
    const getThumbsUrlWithSize = jest.fn().mockReturnValue(modifyURL);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(() => ({
      getThumbsUrlWithSize,
    }));

    rule = RULE.RECTANGLE_IMAGE;
    const result = await getThumbnailURLWithType(model, rule);
    expect(result.url).toEqual('');
    expect(result.type).toEqual(IMAGE_TYPE.ORIGINAL_IMAGE);
  });
});
