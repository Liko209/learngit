import { ItemFileUploadHandler } from '../itemFileUploadHandler';
import AccountService from '../../account';
import { daoManager, ItemDao } from '../../../dao';
import ItemAPI from '../../../api/glip/item';
import handleData from '../handleData';
import { NetworkResultOk } from '../../../api/NetworkResult';
import notificationCenter from '../../notificationCenter';
import { ItemService } from '../itemService';

jest.mock('../../../service/item');
jest.mock('../../../service/account');
jest.mock('../../../api/glip/item');
jest.mock('../../../dao');
jest.mock('../handleData');
jest.mock('../../notificationCenter');

describe('ItemFileService', () => {
  const itemFileUploadHandler = new ItemFileUploadHandler();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendItemFile()', () => {
    const groupId = 1;
    const userId = 2;
    const companyId = 3;
    const itemService = new ItemService();
    const accountService = new AccountService();
    const itemDao = new ItemDao(null);
    beforeEach(() => {
      daoManager.getDao.mockReturnValue(itemDao);
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentCompanyId.mockReturnValue(companyId);
      accountService.getCurrentUserId.mockReturnValue(userId);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
    });

    it('should return null when no file name in fromData', async () => {
      const file = new FormData();
      const result = await itemFileUploadHandler.sendItemFile(
        groupId,
        file,
        false,
      );
      expect(result).toBe(null);
    });

    const storedFile = {
      _id: 123,
      creator_id: 2588675,
      last_modified: 1542274244897,
      download_url: 'url/123.pdf',
      storage_url: 'url/123',
      stored_file_id: 5701644,
      size: 1111,
    };

    const mockStoredFileRes = new NetworkResultOk([storedFile], 200, undefined);

    const itemFile = {
      id: 1,
      versions: [storedFile],
    };

    it('should only have name when a file has no extension', async () => {
      const file = new FormData();
      const fileName = '123';
      file.append('filename', fileName);
      jest
        .spyOn(itemFileUploadHandler, '_sendItemFile')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(itemFileUploadHandler, '_preSaveItemFile')
        .mockImplementationOnce(() => {});

      const res = await itemFileUploadHandler.sendItemFile(
        groupId,
        file,
        false,
      );
      setTimeout(() => {
        expect(res.id).toBeLessThan(0);
        expect(res.name).toBe(fileName);
        expect(res.type).toBe('');
      });
    });

    it('should call go updateItem when group has the file before', async (done: jest.DoneCallback) => {
      const existItems = [
        { id: 1, created_at: 1, versions: [] },
        { id: 4, created_at: 4, versions: [] },
        { id: 5, created_at: 5, versions: [] },
      ];
      const mockItemFileRes = new NetworkResultOk(itemFile, 200, undefined);
      itemDao.get.mockResolvedValue(itemFile);
      itemDao.getExistGroupFilesByName.mockResolvedValue(existItems);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockResolvedValue(mockStoredFileRes);
      ItemAPI.putItem.mockResolvedValue(mockItemFileRes);
      itemService.handlePartialUpdate = jest.fn();
      itemService.updatePreInsertItemStatus = jest.fn();

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      await itemFileUploadHandler.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledTimes(1);
        expect(ItemAPI.putItem).toBeCalledTimes(1);
        expect(ItemAPI.sendFileItem).not.toHaveBeenCalled();
        expect(ItemAPI.putItem).toBeCalled();
        expect(ItemAPI.putItem).toBeCalledWith(
          1,
          'file',
          expect.objectContaining({
            _id: 1,
            created_at: 1,
            is_new: false,
            modified_at: expect.any(Number),
            versions: [
              {
                creator_id: 2588675,
                date: 1542274244897,
                download_url: 'url/123.pdf',
                size: 1111,
                stored_file_id: 123,
                url: 'url/123',
              },
            ],
          }),
        );
        done();
      });
    });

    it('should insert pseudo item to db and return pseudo item', async (done: jest.DoneCallback) => {
      const mockItemFileRes = new NetworkResultOk(itemFile, 200, undefined);
      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockResolvedValue(mockStoredFileRes);
      ItemAPI.sendFileItem.mockResolvedValue(mockItemFileRes);
      itemService.handlePartialUpdate = jest.fn();
      itemService.updatePreInsertItemStatus = jest.fn();

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      const res = await itemFileUploadHandler.sendItemFile(
        groupId,
        file,
        false,
      );

      setTimeout(() => {
        expect(ItemAPI.putItem).not.toHaveBeenCalled();
        expect(ItemAPI.sendFileItem).toBeCalledTimes(1);
        expect(itemDao.put).toBeCalledTimes(2);
        expect(itemDao.update).toBeCalledTimes(1);
        expect(itemDao.delete).toBeCalledTimes(1);
        expect(notificationCenter.emitEntityReplace).toBeCalled();
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledTimes(1);

        expect(res.id).toBeLessThan(0);
        expect(res.creator_id).toBe(userId);
        expect(res.group_ids).toEqual([groupId]);
        expect(res.deactivated).toBeFalsy;
        expect(res.company_id).toBe(companyId);
        expect(res.name).toBe(fileName);
        expect(res.type).toBe('pdf');

        done();
      });
    });
  });

  describe('cancelUpload()', () => {
    const itemDao = new ItemDao(null);
    beforeEach(() => {
      daoManager.getDao.mockReturnValue(itemDao);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
    });

    it('should call item dao delete function', async () => {
      await itemFileUploadHandler.cancelUpload(1);
      expect(itemDao.delete).toBeCalledTimes(1);
    });
  });
});
