/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 13:10:59
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Item } from '../entity';
import { Raw } from '../../../framework/model';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { ControllerBuilder } from '../../../framework/controller/impl/ControllerBuilder';
import { Api } from '../../../api';

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
    const builder = ControllerBuilder.getControllerBuilder<Item>();
    return builder.buildRequestController({
      basePath: `/${path}`,
      networkClient: Api.glipNetworkClient,
    });
  }
}

export { ItemActionController };
