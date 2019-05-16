/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:23:48
 * Copyright © RingCentral. All rights reserved.
 */

import { InteractiveMessageItemController } from '../controller/InteractiveMessageItemController';
import { InteractiveMessageItem } from '../entity';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';
import { EntityBaseService } from '../../../../../framework/service';

class InteractiveMessageItemService extends EntityBaseService<
  InteractiveMessageItem
> {
  private _interactiveMessageItemController: InteractiveMessageItemController;

  constructor() {
    super(false);
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(
        id,
        TypeDictionary.TYPE_ID_INTERACTIVE_MESSAGE_ITEM,
      );
    });
  }

  protected get integrationItemController() {
    if (!this._interactiveMessageItemController) {
      this._interactiveMessageItemController = new InteractiveMessageItemController();
    }
    return this._interactiveMessageItemController;
  }
}

export { InteractiveMessageItemService };
