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
import { ENTITY } from '../../../service/eventKey';
import { IItemService } from '../service/IItemService';

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

  async deleteItem(itemId: number, itemService: IItemService) {
    if (itemId > 0) {
      const requestController = this._buildItemRequestController(
        itemPathMap.get(GlipTypeUtil.extractTypeId(itemId)) as string,
      );
      const partialData = {
        id: itemId,
        deactivated: true,
      };
      await requestController.put(partialData);
    } else {
      await itemService.deleteItem(itemId);
      notificationCenter.emitEntityDelete(ENTITY.ITEM, [itemId]);
      const progressService: ProgressService = ProgressService.getInstance();
      progressService.deleteProgress(itemId);
    }
  }
}

export { ItemActionController };
