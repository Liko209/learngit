/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { SubItemService } from '../../base/service/SubItemService';
import { FileItemController } from '../controller/FileItemController';

class FileItemService extends SubItemService {
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
}

export { FileItemService };
