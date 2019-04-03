import { LogUploaderProxy } from '../LogUploaderProxy';
import { configManager } from '../../../config';
import { logEntityFactory } from '../../../__tests__/factory';

describe('LogUploaderProxy', () => {
  describe('upload()', () => {
    it('should proxy config.uploader', async () => {
      const logUPloaderProxy = new LogUploaderProxy();
      const logs = logEntityFactory.buildList(2);
      const mockUploader = jest.fn();
      configManager.mergeConfig({
        logUploader: {
          upload: mockUploader,
        },
      });
      await logUPloaderProxy.upload(logs);
      expect(mockUploader).toBeCalledWith(logs);
    });
    it('should throw error when config.uploader not exists', async () => {
      const logUPloaderProxy = new LogUploaderProxy();
      const logs = logEntityFactory.buildList(2);
      configManager.mergeConfig({
        logUploader: null,
      });
      await expect(logUPloaderProxy.upload(logs)).rejects.toBeInstanceOf(Error);
    });
  });
  describe('errorHandler()', () => {
    it('should proxy config.uploader', () => {
      const logUPloaderProxy = new LogUploaderProxy();
      const error = new Error('test');
      const mockHandler = jest.fn();
      configManager.mergeConfig({
        logUploader: {
          errorHandler: mockHandler,
        },
      });
      logUPloaderProxy.errorHandler(error);
      expect(mockHandler).toBeCalledWith(error);
    });
    it('should return retry when NO_INJECT_ERROR', () => {
      const logUPloaderProxy = new LogUploaderProxy();
      expect(
        logUPloaderProxy.errorHandler(new Error('NO_INJECT_ERROR')),
      ).toEqual('retry');
    });
  });
});
