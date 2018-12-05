import { ItemFileService } from '../itemFileService';

describe('ItemFileService', () => {
  const itemFileService = new ItemFileService();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendItemFile()', () => {
    it('send item file, invalid parameter', async () => {
      const result = await itemFileService.sendItemFile(0, undefined, false);
      expect(result).toBe(null);
    });
  });

  describe('cancelUpload()', () => {
    it('cancel upload with invalid paramter', async () => {
      const result = await itemFileService.cancelUpload(0);
      expect(result).toBe(false);
    });
  });

  describe('getUploadItems()', () => {
    it('items are empty', async () => {
      const result = await itemFileService.getUploadItems();
      expect(result).toBe(null);
    });
  });

  describe('isFileExists()', () => {
    it('check file exists with invalid paramter', async () => {
      const result = await itemFileService.isFileExists('', '');
      expect(result).toBe(false);
    });
  });

  describe('getUploadProgress()', () => {
    it('get progress invalid id', async () => {
      const result = await itemFileService.getUploadProgress(0);
      expect(result).toBe(0);
    });
  });
});
