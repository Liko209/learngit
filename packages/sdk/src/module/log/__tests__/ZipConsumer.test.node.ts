/*
 * @Author: Paynter Chen
 * @Date: 2019-05-06 08:56:20
 * Copyright © RingCentral. All rights reserved.
 */
import { ZipConsumer } from '../ZipConsumer';
import { IZipProducer } from '../types';
import { configManager } from '../config';

global.Blob = () => {
  return {
    size: 111,
  };
};
jest.mock('filestack-js', () => {
  const mockClient = {
    upload: jest.fn(),
  };
  const mock = {
    init: () => mockClient,
  };
  return mock;
});

describe('ZipConsumer', () => {
  describe('consume()', () => {
    it('should upload localZip', async () => {
      configManager.mergeConfig({
        zipLogAutoUpload: true,
      });
      const localZips = [
        {
          index: 0,
          name: 'test',
          blob: new Blob(),
        },
      ];
      const mockProducer: IZipProducer = {
        produce: () => {
          return localZips.shift() || null;
        },
      };
      const uploaded = [];
      const consumer = new ZipConsumer(mockProducer, result => {
        uploaded.push(result);
      });
      (consumer.uploadClient.upload as jest.Mock).mockReturnValue({
        filename: 'test',
        handle: '123',
        size: 1111,
        url: 'uuu',
      });
      await consumer.consume();
      expect(consumer.uploadClient.upload).toHaveBeenCalled();
      expect(uploaded.length).toEqual(1);
    });
    it('should upload localZips', async () => {
      configManager.mergeConfig({
        zipLogAutoUpload: true,
      });
      const localZips = [
        {
          index: 0,
          name: 'test',
          blob: new Blob(),
        },
        {
          index: 1,
          name: 'test',
          blob: new Blob(),
        },
      ];
      const mockProducer: IZipProducer = {
        produce: () => {
          return localZips.shift() || null;
        },
      };
      const uploaded = [];
      const consumer = new ZipConsumer(mockProducer, result => {
        uploaded.push(result);
      });
      (consumer.uploadClient.upload as jest.Mock).mockReturnValue({
        filename: 'test',
        handle: '123',
        size: 1111,
        url: 'uuu',
      });
      await consumer.consume();
      expect(consumer.uploadClient.upload).toHaveBeenCalled();
      expect(uploaded.length).toEqual(2);
    });
  });
});
