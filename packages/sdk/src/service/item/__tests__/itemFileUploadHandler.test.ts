import { ItemFileUploadHandler } from '../itemFileUploadHandler';

describe('ItemFileService', () => {
  const itemFileUploadHandler = new ItemFileUploadHandler();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendItemFile()', () => {
    it('send item file, invalid parameter', async () => {
      const result = await itemFileUploadHandler.sendItemFile(
        0,
        undefined,
        false,
      );
      expect(result).toBe(null);
    });
  });

  describe('cancelUpload()', () => {
    it('cancel upload, invalid parameter', async () => {
      const result = await itemFileUploadHandler.cancelUpload(0);
      expect(result).toBe(false);
    });
  });
});
