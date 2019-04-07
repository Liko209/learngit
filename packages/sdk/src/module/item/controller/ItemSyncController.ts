/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-18 13:39:25
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import { TypeDictionary } from '../../../utils';
import ItemApi from '../../../api/glip/item';
import { IItemService } from '../service/IItemService';
import { GroupConfigService } from '../../groupConfig';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { GroupConfig } from '../../groupConfig/entity';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';

const AvailableSocketStatus = ['connected', 'connecting'];
const GroupItemKeyMap = {
  [TypeDictionary.TYPE_ID_TASK]: 'last_index_of_tasks',
  [TypeDictionary.TYPE_ID_FILE]: 'last_index_of_files',
  [TypeDictionary.TYPE_ID_PAGE]: 'last_index_of_notes',
  [TypeDictionary.TYPE_ID_EVENT]: 'last_index_of_events',
  [TypeDictionary.TYPE_ID_LINK]: 'last_index_of_links',
};

class ItemSyncController {
  private _syncedGroupIds: Set<number> = new Set();
  constructor(private _itemService: IItemService) {
    notificationCenter.on(SERVICE.SOCKET_STATE_CHANGE, (state: string) => {
      this._onSocketIoStateChanged(state);
    });
  }

  private _onSocketIoStateChanged(state: string) {
    if (!AvailableSocketStatus.includes(state)) {
      this._syncedGroupIds.clear();
    }
  }

  async requestSyncGroupItems(groupId: number) {
    if (this._syncedGroupIds.has(groupId)) {
      return;
    }
    this._syncedGroupIds.add(groupId);

    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    const groupConfig = await groupConfigService.getById(groupId);
    const typeIdKeys = Object.keys(GroupItemKeyMap);
    typeIdKeys.forEach((typeIdKey: string) => {
      const typeId = Number(typeIdKey);
      this._requestSyncGroupItems(
        groupId,
        typeId,
        groupConfig ? this._getGroupItemNewerThan(groupConfig, typeId) : 0,
      );
    });
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
