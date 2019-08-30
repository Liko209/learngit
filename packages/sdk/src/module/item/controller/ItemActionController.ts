/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 13:10:59
 * Copyright © RingCentral. All rights reserved.
 */
import { Item, ConferenceItem, ZoomMeetingItem } from '../entity';
import { Raw } from '../../../framework/model';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { buildRequestController } from '../../../framework/controller';
import { Api } from '../../../api';
import ItemAPI from 'sdk/api/glip/item';
import {
  GlipTypeUtil,
  TypeDictionary,
} from '../../../utils/glip-type-dictionary';
import notificationCenter from '../../../service/notificationCenter';
import { ProgressService } from '../../progress';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { ItemNotification } from '../utils/ItemNotification';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { IItemService } from '../service/IItemService';
import { mainLogger } from 'foundation/log';

const itemPathMap: Map<number, string> = new Map([
  [TypeDictionary.TYPE_ID_FILE, 'file'],
  [TypeDictionary.TYPE_ID_TASK, 'task'],
  [TypeDictionary.TYPE_ID_PAGE, 'page'],
  [TypeDictionary.TYPE_ID_EVENT, 'event'],
  [TypeDictionary.TYPE_ID_LINK, 'link'],
  [TypeDictionary.TYPE_ID_CODE, 'code'],
  [TypeDictionary.TYPE_ID_CONFERENCE, 'conference'],
  [TypeDictionary.TYPE_ID_MEETING, 'meeting']
]);
class ItemActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<Item>,
    private _entitySourceController: IEntitySourceController<Item>,
    private _itemService: IItemService,
  ) {}

  async doNotRenderItem(id: number, type: string) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Item>>,
    ): Partial<Raw<Item>> => ({
      ...partialPost,
      do_not_render: true,
    });

    const doUpdateModel = async (updateItem: Item) =>
      await this._buildItemRequestController(type).put(updateItem);

    await this._partialModifyController.updatePartially({
      entityId: id,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: doUpdateModel,
    });
  }

  async cancelZoomMeeting(id: number) {
    const preHandlePartial = (
      partialPost: Partial<Raw<ZoomMeetingItem>>,
    ): Partial<Raw<ZoomMeetingItem>> => ({
      ...partialPost,
      status: 'cancelled',
    });
    const doUpdateModel = async (updateItem: Item) => {
      const requestController = this._buildItemRequestController(
        itemPathMap.get(GlipTypeUtil.extractTypeId(id)) as string,
      );
      return await requestController.put(updateItem);
    }


    await this._partialModifyController.updatePartially({
      entityId: id,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: doUpdateModel,
    });
  }

  private _buildItemRequestController(path: string) {
    return buildRequestController<Item>({
      basePath: `/${path}`,
      networkClient: Api.glipNetworkClient,
    });
  }

  async deleteItem(itemId: number) {
    if (itemId > 0) {
      const preHandlePartial = (
        partialItem: Partial<Raw<Item>>,
      ): Partial<Raw<Item>> => ({
        ...partialItem,
        deactivated: true,
      });

      const doUpdateModel = async (updateItem: Item) => {
        const requestController = this._buildItemRequestController(
          itemPathMap.get(GlipTypeUtil.extractTypeId(itemId)) as string,
        );
        return await requestController.put(updateItem);
      };

      await this._partialModifyController.updatePartially({
        entityId: itemId,
        preHandlePartialEntity: preHandlePartial,
        doUpdateEntity: doUpdateModel,
      });
    } else {
      const item = await this._entitySourceController.get(itemId);
      this._entitySourceController.delete(itemId);

      if (item) {
        const notifications = ItemNotification.getItemsNotifications([item]);
        notifications.forEach(
          (notification: { eventKey: string; entities: Item[] }) => {
            notificationCenter.emitEntityDelete(
              notification.eventKey,
              notification.entities.map((item: Item) => item.id),
            );
          },
        );
      }

      const progressService = ServiceLoader.getInstance<ProgressService>(
        ServiceConfig.PROGRESS_SERVICE,
      );
      progressService.deleteProgress(itemId);
    }
  }

  async startConference(groupId: number): Promise<ConferenceItem> {
    const rawConference = await ItemAPI.startRCConference({
      group_ids: [groupId],
    });
    const conferences = await this._itemService.handleIncomingData([
      rawConference,
    ]);
    if (conferences && conferences.length) {
      return conferences[0];
    }
    mainLogger.warn('start conference raw data', rawConference);
    throw new Error('empty result');
  }
}

export { ItemActionController };
