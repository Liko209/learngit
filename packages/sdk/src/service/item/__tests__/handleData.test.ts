import ItemAPI from '../../../api/glip/item';
import { daoManager } from '../../../dao';
import UploadManager from '../../../service/UploadManager';
import { transform, baseHandleData } from '../../../service/utils';
import handleData, {
  uploadStorageFile,
  sendFileItem,
  extractFileNameAndType,
  Options,
} from '../handleData';
import {
  storedFileFactory,
  rawItemFactory,
} from '../../../__tests__/factories';
import { ApiResultOk } from '../../../api/ApiResult';

jest.mock('../../../api/glip/item');
// const itemDao = daoManager.getDao(ItemDao);
jest.mock('../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(),
  },
}));

jest.mock('../../../service/utils', () => ({
  baseHandleData: jest.fn(),
  transform: jest.fn(),
}));

ItemAPI.uploadFileItem = jest.fn();
ItemAPI.sendFileItem = jest.fn();

beforeEach(async () => {
  // itemDao.clear();
  ItemAPI.uploadFileItem.mockClear();
  ItemAPI.sendFileItem.mockClear();
});

describe('handleData()', () => {
  it('should insert transformed data', async () => {
    const item = rawItemFactory.build({ _id: 1 });
    delete item.id;
    await handleData([item]);
    expect(baseHandleData).toHaveBeenCalled();
    expect(transform).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao).toHaveBeenCalled();
  });

  it('should insert nothing', async () => {
    const ret = await handleData([]);
    expect(ret).toBeUndefined();
  });
});

describe('uploadStorageFile()', () => {
  it('should return mock response data', async () => {
    ItemAPI.uploadFileItem.mockReturnValue(
      new ApiResultOk('mock response data', 200, {}),
    );
    const result = await uploadStorageFile({
      file: new FormData(),
      groupId: '1',
    });
    expect(result).toEqual('mock response data');
  });

  it('should emit progress event', async () => {
    expect.assertions(1);
    ItemAPI.uploadFileItem.mockImplementation(async (file, onProgress) => {
      onProgress({ loaded: 1, total: 10 });
      return new ApiResultOk('mock response data', 200, {});
    });

    UploadManager.on('1', progress => expect(progress).toEqual('10'));

    await uploadStorageFile({
      file: new FormData(),
      groupId: '1',
    });
  });
});

describe('sendFileItem()', () => {
  const options: Options = {
    storedFile: storedFileFactory.build({
      id: 1243,
      created_at: 1234,
      creator_id: 12443,
      storage_path: 'fake/path/file.txt',
    }),
    groupId: '1',
  };
  it('should return the response of ItemAPI.sendFileItem()', async () => {
    ItemAPI.sendFileItem.mockReturnValue(
      new ApiResultOk('mock response data', 200, {}),
    );

    const result = await sendFileItem(options);

    expect(result).toEqual('mock response data');
  });
  it('should return the error', async () => {
    ItemAPI.sendFileItem.mockImplementation(() => {
      throw new Error('error');
    });
    try {
      await sendFileItem(options);
    } catch (e) {
      expect(e).toEqual(new Error('error'));
    }
  });
});

describe('extractFileNameAndType()', () => {
  it('should extract the file name when full file path was given', () => {
    const result = extractFileNameAndType('fake/path/file.txt');
    expect(result).toEqual({ name: 'file.txt', type: 'txt' });
  });

  it('should extract the file name when short file name was given', () => {
    const result = extractFileNameAndType('file.txt');
    expect(result).toEqual({ name: 'file.txt', type: 'txt' });
  });

  it('should throw error when file path is empty', () => {
    expect(extractFileNameAndType('')).toEqual({
      name: '',
      type: '',
    });
  });
});
