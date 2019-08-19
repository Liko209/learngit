/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-24 10:20:08
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoUserConfig } from '../config';
import { RC_INFO_KEYS } from '../config/constants';
import { UndefinedAble } from 'sdk/types';
import { BlockNumberItem, RCInfoApi, BLOCK_STATUS } from 'sdk/api';
import { CONFIG_EVENT_TYPE } from 'sdk/module/config/constants';
import { mainLogger } from 'foundation/log';

const LOG_TAG = 'BlockNumberController';

class BlockNumberController {
  private _blockNumberMap: UndefinedAble<Map<string, string>> = undefined;

  constructor(private _DBConfig: RCInfoUserConfig) {}

  init() {
    this._DBConfig.on(RC_INFO_KEYS.BLOCK_NUMBER, this._updateBlockNumberMap);
  }

  dispose() {
    this._DBConfig.off(RC_INFO_KEYS.BLOCK_NUMBER, this._updateBlockNumberMap);
  }

  async isNumberBlocked(phoneNumber: string): Promise<boolean> {
    const blockNumberMap = await this._getBlockNumberMap();
    return !!(blockNumberMap && blockNumberMap.has(phoneNumber));
  }

  async deleteBlockedNumbers(phoneNumbers: string[]): Promise<void> {
    let blockNumberList = await this._DBConfig.getBlockNumbers();
    const deleteSet = new Set(phoneNumbers);
    const deleteIds: string[] = [];

    if (!blockNumberList) {
      mainLogger
        .tags(LOG_TAG)
        .info('can not get blockList for delete:', phoneNumbers);
      return;
    }

    blockNumberList = blockNumberList.filter((blockNumber: BlockNumberItem) => {
      if (
        this._isValidBlockNumber(blockNumber) &&
        deleteSet.has(blockNumber.phoneNumber)
      ) {
        deleteIds.push(blockNumber.id);
        return false;
      }
      return true;
    });
    if (deleteIds.length) {
      await RCInfoApi.deleteBlockNumbers(deleteIds);
      await this._DBConfig.setBlockNumbers(blockNumberList);
      phoneNumbers.forEach((phoneNumber: string) => {
        this._blockNumberMap && this._blockNumberMap.delete(phoneNumber);
      });
    }
  }

  async addBlockedNumber(phoneNumber: string): Promise<void> {
    const blockNumberList = (await this._DBConfig.getBlockNumbers()) || [];
    const isExist = blockNumberList.some((blockNumber: BlockNumberItem) => (
      this._isValidBlockNumber(blockNumber) &&
        blockNumber.phoneNumber === phoneNumber
    ));

    if (isExist) {
      mainLogger
        .tags(LOG_TAG)
        .info('already exist blocked number:', phoneNumber);
      return;
    }

    const result = await RCInfoApi.addBlockNumbers({
      phoneNumber,
      status: BLOCK_STATUS.BLOCKED,
    });
    blockNumberList.push(result);
    await this._DBConfig.setBlockNumbers(blockNumberList);
    this._blockNumberMap &&
      result.id &&
      this._blockNumberMap.set(result.phoneNumber, result.id);
  }

  private async _getBlockNumberMap(): Promise<
  UndefinedAble<Map<string, string>>
  > {
    if (!this._blockNumberMap) {
      const blockNumberList = await this._DBConfig.getBlockNumbers();
      if (blockNumberList) {
        this._blockNumberMap = new Map();
        blockNumberList.forEach((blockNumber: BlockNumberItem) => {
          this._blockNumberMap &&
            this._isValidBlockNumber(blockNumber) &&
            this._blockNumberMap.set(blockNumber.phoneNumber, blockNumber.id);
        });
      }
    }
    return this._blockNumberMap;
  }

  private _updateBlockNumberMap = async (
    event: CONFIG_EVENT_TYPE,
    value: BlockNumberItem[],
  ): Promise<void> => {
    if (event === CONFIG_EVENT_TYPE.UPDATE) {
      this._blockNumberMap = new Map();
      value.forEach((blockNumber: BlockNumberItem) => {
        this._blockNumberMap &&
          this._isValidBlockNumber(blockNumber) &&
          this._blockNumberMap.set(blockNumber.phoneNumber, blockNumber.id);
      });
    }
  }

  private _isValidBlockNumber(blockNumber: BlockNumberItem): boolean {
    return !!(blockNumber.id && blockNumber.phoneNumber);
  }
}

export { BlockNumberController };
