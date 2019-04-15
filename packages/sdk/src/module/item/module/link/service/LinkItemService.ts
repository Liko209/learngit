/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:59
 * Copyright © RingCentral. All rights reserved.
 */

import { LinkItemController } from '../controller/LinkItemController';
import { LinkItem, SanitizedLinkItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { LinkItemDao } from '../dao/LinkItemDao';
import { daoManager } from '../../../../../dao';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';

class LinkItemService extends BaseSubItemService<LinkItem, SanitizedLinkItem> {
  private _linkItemController: LinkItemController;

  constructor() {
    super(daoManager.getDao<LinkItemDao>(LinkItemDao));
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_LINK);
    });
  }

  protected get linkItemController() {
    if (!this._linkItemController) {
      this._linkItemController = new LinkItemController();
    }
    return this._linkItemController;
  }
}

export { LinkItemService };
