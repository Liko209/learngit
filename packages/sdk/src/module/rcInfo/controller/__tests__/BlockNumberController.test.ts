/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-24 18:14:22
 * Copyright © RingCentral. All rights reserved.
 */

import { BlockNumberController } from '../BlockNumberController';
import { RC_INFO_KEYS } from '../../config/constants';
import { CONFIG_EVENT_TYPE } from 'sdk/module/config/constants';
import { RCInfoApi, BLOCK_STATUS } from 'sdk/api';

describe('BlockNumberController', () => {
  let controller: BlockNumberController;
  const mockConfig = {
    on: jest.fn(),
    off: jest.fn(),
    getBlockNumbers: jest.fn(),
    setBlockNumbers: jest.fn(),
  } as any;

  beforeEach(() => {
    controller = new BlockNumberController(mockConfig);
  });

  describe('init', () => {
    it('should call config.on', () => {
      controller.init();
      expect(mockConfig.on).toBeCalledWith(
        RC_INFO_KEYS.BLOCK_NUMBER,
        controller['_updateBlockNumberMap'],
      );
    });
  });

  describe('dispose', () => {
    it('should call config.off', () => {
      controller.dispose();
      expect(mockConfig.off).toBeCalledWith(
        RC_INFO_KEYS.BLOCK_NUMBER,
        controller['_updateBlockNumberMap'],
      );
    });
  });

  describe('isNumberBlocked', () => {
    it('should return false when map is invalid', async () => {
      controller['_getBlockNumberMap'] = jest.fn().mockReturnValue(undefined);
      expect(await controller.isNumberBlocked('156879')).toBeFalsy();
    });

    it('should return true when map contain number', async () => {
      controller['_getBlockNumberMap'] = jest
        .fn()
        .mockReturnValue(new Map([['156879', '465']]));
      expect(await controller.isNumberBlocked('156879')).toBeTruthy();
    });

    it('should return false when map does not contain number', async () => {
      controller['_getBlockNumberMap'] = jest
        .fn()
        .mockReturnValue(new Map([['15687', '465']]));
      expect(await controller.isNumberBlocked('156879')).toBeFalsy();
    });
  });

  describe('deleteBlockedNumbers', () => {
    it('should not send request when deleteIds is empty', async () => {
      controller['_blockNumberMap'] = new Map([['1456', '1'], ['2456', '2']]);
      mockConfig.getBlockNumbers.mockReturnValue([
        { id: '1', phoneNumber: '1456' },
        { id: '2', phoneNumber: '2456' },
        { phoneNumber: '3456' },
        { id: '3' },
      ]);
      RCInfoApi.deleteBlockNumbers = jest.fn();
      await controller.deleteBlockedNumbers(['456', '5456', '3456', '4456']);
      expect(mockConfig.getBlockNumbers).toBeCalled();
      expect(RCInfoApi.deleteBlockNumbers).not.toBeCalled();
      expect(controller['_blockNumberMap'].size).toEqual(2);
    });

    it('should send request and delete from local when deleteIds is not empty', async () => {
      controller['_blockNumberMap'] = new Map([['1456', '1'], ['2456', '2']]);
      mockConfig.getBlockNumbers.mockReturnValue([
        { id: '1', phoneNumber: '1456' },
        { id: '2', phoneNumber: '2456' },
        { phoneNumber: '3456' },
        { id: '3' },
      ]);
      RCInfoApi.deleteBlockNumbers = jest.fn();
      await controller.deleteBlockedNumbers(['2456', '3456', '3456', '456']);
      expect(mockConfig.getBlockNumbers).toBeCalled();
      expect(RCInfoApi.deleteBlockNumbers).toBeCalledWith(['2']);
      expect(mockConfig.setBlockNumbers).toBeCalledWith([
        { id: '1', phoneNumber: '1456' },
        { phoneNumber: '3456' },
        { id: '3' },
      ]);
      expect(controller['_blockNumberMap'].size).toEqual(1);
    });
  });

  describe('addBlockedNumber', () => {
    it('should not send request when number is exist', async () => {
      mockConfig.getBlockNumbers.mockReturnValue([
        { id: '1', phoneNumber: '1456' },
      ]);
      RCInfoApi.addBlockNumbers = jest.fn();
      await controller.addBlockedNumber('1456');
      expect(mockConfig.getBlockNumbers).toBeCalled();
      expect(RCInfoApi.addBlockNumbers).not.toBeCalled();
      expect(controller['_blockNumberMap']).toBeUndefined();
    });

    it('should send request when number is not exist', async () => {
      controller['_blockNumberMap'] = new Map();
      const mockData = {
        id: '333',
        phoneNumber: '2456',
        status: BLOCK_STATUS.BLOCKED,
      };
      mockConfig.getBlockNumbers.mockReturnValue([
        { id: '1', phoneNumber: '1456' },
      ]);
      RCInfoApi.addBlockNumbers = jest.fn().mockReturnValue(mockData);
      await controller.addBlockedNumber(mockData.phoneNumber);
      expect(mockConfig.getBlockNumbers).toBeCalled();
      expect(RCInfoApi.addBlockNumbers).toBeCalledWith({
        phoneNumber: '2456',
        status: BLOCK_STATUS.BLOCKED,
      });
      expect(mockConfig.setBlockNumbers).toBeCalledWith([
        { id: '1', phoneNumber: '1456' },
        mockData,
      ]);
      expect(controller['_blockNumberMap'].get('2456')).toEqual('333');
    });

    it('should send request when blocks is undefined', async () => {
      const mockData = {
        phoneNumber: '1456',
        status: BLOCK_STATUS.BLOCKED,
      };
      mockConfig.getBlockNumbers.mockReturnValue(undefined);
      RCInfoApi.addBlockNumbers = jest.fn().mockReturnValue(mockData);
      await controller.addBlockedNumber(mockData.phoneNumber);
      expect(mockConfig.getBlockNumbers).toBeCalled();
      expect(RCInfoApi.addBlockNumbers).toBeCalledWith(mockData);
      expect(mockConfig.setBlockNumbers).toBeCalledWith([mockData]);
    });
  });

  describe('_getBlockNumberMap', () => {
    it('should return undefined when blockNumberList is empty', async () => {
      mockConfig.getBlockNumbers.mockReturnValue(undefined);
      expect(await controller['_getBlockNumberMap']()).toBeUndefined();
    });

    it('should return map when blockNumberList is valid', async () => {
      mockConfig.getBlockNumbers.mockReturnValue([
        { id: '123', phoneNumber: '55' },
      ]);
      const result = await controller['_getBlockNumberMap']();
      expect(result).not.toBeUndefined();
      expect(result!.size).toEqual(1);
    });
  });

  describe('_updateBlockNumberMap', () => {
    it('should update map when blockNumberList is valid', async () => {
      const mockData = [
        { id: '123', phoneNumber: '55' },
        { id: '1253', phoneNumber: '57' },
      ] as any;
      await controller['_updateBlockNumberMap'](
        CONFIG_EVENT_TYPE.UPDATE,
        mockData,
      );
      expect(controller['_blockNumberMap']).not.toBeUndefined();
      expect(controller['_blockNumberMap']!.size).toEqual(2);
    });
  });
});
