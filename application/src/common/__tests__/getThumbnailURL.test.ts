/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:27:17
 * Copyright © RingCentral. All rights reserved.
 */
import FileItemModel from '../../store/models/FileItem';
import { getThumbnailURL } from '../getThumbnailURL';

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
