/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { FileItemController } from '../controller/FileItemController';
import { EntityBaseService } from '../../../../../framework/service';

class FileItemService extends EntityBaseService implements ISubItemService {
  private _fileItemController: FileItemController;
  constructor() {
    super();
  }

  protected get fileItemController() {
    if (!this._fileItemController) {
      this._fileItemController = new FileItemController();
    }
    return this._fileItemController;
  }

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(): void {}
}

export { FileItemService };
