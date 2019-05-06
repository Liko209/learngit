/*
 * @Author: Paynter Chen
 * @Date: 2019-05-06 08:56:20
 * Copyright © RingCentral. All rights reserved.
 */
import { ZipLogZipItemProvider } from '../ZipLogZipItemProvider';
import { ZipConsumer } from '../ZipConsumer';

jest.mock('../utils', () => {
  return {
    createWorker: () => {
      zip: () => {};
    },
  };
});
jest.mock('../ZipConsumer');

describe('ZipLogZipItemProvider', () => {
  describe('addZip()', () => {
    it('should add zip', async () => {
      const provider = new ZipLogZipItemProvider();
      provider.worker = {
        zip: async () => new Blob(),
      };
      await provider.addZip([{ message: 'test' }]);
      // expect()
      expect(provider['zips'].length).toEqual(1);
    });
  });
  describe('getZipItems()', () => {
    it('should get zip items from zips, uploading, uploaded', async () => {
      const provider = new ZipLogZipItemProvider();
      provider['zips'] = [
        {
          index: 0,
          name: 'test',
          blob: new Blob(),
        },
      ];
      (provider.zipConsumer.getUploading as jest.Mock).mockReturnValue([
        {
          index: 1,
          name: 'test',
          blob: new Blob(),
        },
      ]);
      provider['uploaded'] = [
        {
          index: 2,
          fileId: 'id',
          url: 'abc',
        },
      ];
      const zipItems = await provider.getZipItems();
      expect(zipItems.length).toEqual(3);
    });
  });
});
