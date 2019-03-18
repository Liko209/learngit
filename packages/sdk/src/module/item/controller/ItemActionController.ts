/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 13:10:59
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Item } from '../entity';
import { Raw } from '../../../framework/model';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { buildRequestController } from '../../../framework/controller';
import { Api } from '../../../api';
import {
  GlipTypeUtil,
  TypeDictionary,
} from '../../../utils/glip-type-dictionary';
import notificationCenter from '../../../service/notificationCenter';
import { ProgressService } from '../../progress';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { ItemNotification } from '../utils/ItemNotification';

const itemPathMap: Map<number, string> = new Map([
  [TypeDictionary.TYPE_ID_FILE, 'file'],
  [TypeDictionary.TYPE_ID_TASK, 'task'],
  [TypeDictionary.TYPE_ID_PAGE, 'page'],
  [TypeDictionary.TYPE_ID_EVENT, 'event'],
  [TypeDictionary.TYPE_ID_LINK, 'link'],
  [TypeDictionary.TYPE_ID_CODE, 'code'],
  [TypeDictionary.TYPE_ID_CONFERENCE, 'conference'],
]);
class ItemActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<Item>,
    private _entitySourceController: IEntitySourceController<Item>,
  ) {}

  async doNotRenderItem(id: number, type: string) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Item>>,
      originalPost: Item,
    ): Partial<Raw<Item>> => {
      return {
        ...partialPost,
        do_not_render: true,
      };
    };

    const doUpdateModel = async (updateItem: Item) => {
      return await this._buildItemRequestController(type).put(updateItem);
    };

    await this._partialModifyController.updatePartially(
      id,
      preHandlePartial,
      doUpdateModel,
    );
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
        originalItem: Item,
      ): Partial<Raw<Item>> => {
        return {
          ...partialItem,
          deactivated: true,
        };
      };

      const doUpdateModel = async (updateItem: Item) => {
        const requestController = this._buildItemRequestController(
          itemPathMap.get(GlipTypeUtil.extractTypeId(itemId)) as string,
        );
        return await requestController.put(updateItem);
      };

      await this._partialModifyController.updatePartially(
        itemId,
        preHandlePartial,
        doUpdateModel,
      );
    } else {
      const item = await this._entitySourceController.get(itemId);
      this._entitySourceController.delete(itemId);

      if (item) {
        const notifications = ItemNotification.getItemsNotifications([item]);
        notifications.forEach(
          (notification: { eventKey: string; entities: Item[] }) => {
            notificationCenter.emitEntityDelete(
              notification.eventKey,
              notification.entities.map((item: Item) => {
                return item.id;
              }),
            );
          },
        );
      }

      const progressService: ProgressService = ProgressService.getInstance();
      progressService.deleteProgress(itemId);
    }
  }
}

export { ItemActionController };
