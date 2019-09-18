/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-18 13:39:25
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';
import { TypeDictionary } from '../../../utils';
import ItemApi from '../../../api/glip/item';
import { IItemService } from '../service/IItemService';
import { GroupConfigService } from '../../groupConfig';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { GroupConfig } from '../../groupConfig/entity';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import {
  SequenceProcessorHandler,
  IProcessor,
  SingletonSequenceProcessor,
} from '../../../framework/processor';

const AvailableSocketStatus = ['connected', 'connecting'];
const GroupItemKeyMap = {
  [TypeDictionary.TYPE_ID_TASK]: 'last_index_of_tasks',
  [TypeDictionary.TYPE_ID_FILE]: 'last_index_of_files',
  [TypeDictionary.TYPE_ID_PAGE]: 'last_index_of_notes',
  [TypeDictionary.TYPE_ID_EVENT]: 'last_index_of_events',
  [TypeDictionary.TYPE_ID_LINK]: 'last_index_of_links',
};

type ItemSyncInfo = {
  groupId: number;
  typeId: number;
  newerThan: number;
};

class ItemSyncProcessor implements IProcessor {
  constructor(
    private _itemSyncItem: ItemSyncInfo,
    private _processFunc: (itemSyncItem: ItemSyncInfo) => Promise<void>,
    private _onCancelled: (itemSyncItem: ItemSyncInfo) => void,
  ) {}

  async process(): Promise<boolean> {
    try {
      mainLogger.debug(`item fetch start: ${this.name()}`);
      await this._processFunc(this._itemSyncItem);
      mainLogger.debug(`item fetch end: ${this.name()}`);
    } catch (e) {
      mainLogger.warn(`failed to items of group ${this.name()}`, e);
    }
    return Promise.resolve(true);
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return `${this._itemSyncItem.groupId}.${this._itemSyncItem.typeId}.${
      this._itemSyncItem.newerThan
    }`;
  }

  cancel(): void {
    this._onCancelled(this._itemSyncItem);
  }
}

class ItemSyncController {
  private _syncedGroupItems: Set<string> = new Set();
  private _itemSequenceProcessor: SequenceProcessorHandler;
  private _itemSyncMaxProcessors: number = 10;
  constructor(private _itemService: IItemService) {
    this._itemSequenceProcessor = SingletonSequenceProcessor.getSequenceProcessorHandler(
      {
        name: 'ItemSequenceProcessor',
        addProcessorStrategy: this._addItemSyncStrategy,
        maxSize: this._itemSyncMaxProcessors,
        onExceedMaxSize: this._onExceedMaxSize,
      },
    );

    notificationCenter.on(SERVICE.SOCKET_STATE_CHANGE, (state: string) => {
      this._onSocketIoStateChanged(state);
    });
  }

  private _onSocketIoStateChanged(state: string) {
    if (!AvailableSocketStatus.includes(state)) {
      this._itemSequenceProcessor.cancelAll();
      this._syncedGroupItems.clear();
    }
  }

  private _getItemSyncKey(groupId: number, typeId: number) {
    return `${groupId}.${typeId}`;
  }

  private _addItemSyncStrategy = (
    totalProcessors: IProcessor[],
    newProcessor: IProcessor,
    existed: boolean,
  ) => {
    let result: IProcessor[] = totalProcessors;
    if (existed) {
      result = result.filter(
        (item: IProcessor) => item.name() !== newProcessor.name(),
      );
    }
    result.unshift(newProcessor);
    return result;
  };

  private _onExceedMaxSize = (totalProcessors: IProcessor[]) => {
    const lastProcessor = totalProcessors.pop();
    if (lastProcessor && lastProcessor.cancel) {
      lastProcessor.cancel();
    }
  };

  async requestSyncGroupItems(groupId: number) {
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    const groupConfig =
      groupConfigService.getSynchronously(groupId) ||
      (await groupConfigService.getById(groupId));
    const typeIdKeys = Object.keys(GroupItemKeyMap).reverse();
    const itemSyncProcessors: IProcessor[] = [];
    typeIdKeys.forEach((typeIdKey: string) => {
      const typeId = Number(typeIdKey);
      const itemSyncInfo = {
        groupId,
        typeId,
        newerThan: groupConfig
          ? this._getGroupItemNewerThan(groupConfig, typeId)
          : 0,
      };

      const itemKey = this._getItemSyncKey(groupId, typeId);
      if (this._syncedGroupItems.has(itemKey)) {
        return;
      }
      this._syncedGroupItems.add(itemKey);

      itemSyncProcessors.push(this._getItemSyncProcessor(itemSyncInfo));
    });

    if (itemSyncProcessors.length) {
      this._itemSequenceProcessor.addProcessors(itemSyncProcessors);
    }
  }

  private _getItemSyncProcessor(itemSyncInfo: ItemSyncInfo) {
    return new ItemSyncProcessor(
      itemSyncInfo,
      async (itemSyncInfo: ItemSyncInfo) => {
        await this._requestSyncGroupItems(
          itemSyncInfo.groupId,
          itemSyncInfo.typeId,
          itemSyncInfo.newerThan,
        );
      },
      (itemSyncInfo: ItemSyncInfo) => {
        const itemKey = this._getItemSyncKey(
          itemSyncInfo.groupId,
          itemSyncInfo.typeId,
        );
        this._syncedGroupItems.delete(itemKey);
      },
    );
  }

  private async _requestSyncGroupItems(
    groupId: number,
    typeId: number,
    newerThen: number,
  ) {
    let result;
    try {
      result = await ItemApi.getItems(typeId, groupId, newerThen);
      await this._updateGroupItemNewerThan(groupId, typeId);
      await this._itemService.getItemDataHandler()(result);
    } catch (error) {
      mainLogger.info(
        `failed to request type:${typeId} of group($groupId)`,
        error,
      );
      const itemKey = this._getItemSyncKey(groupId, typeId);
      this._syncedGroupItems.delete(itemKey);
    }
  }

  private _getGroupItemNewerThan(groupConfig: GroupConfig, typeId: number) {
    return groupConfig[GroupItemKeyMap[typeId]] || 0;
  }

  private async _updateGroupItemNewerThan(groupId: number, typeId: number) {
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    const partialData = {
      id: groupId,
      [GroupItemKeyMap[typeId]]: Date.now(),
    };

    await groupConfigService.saveAndDoNotify(partialData);
  }
}

export { ItemSyncController };
