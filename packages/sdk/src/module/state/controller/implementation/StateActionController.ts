/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState } from '../../entity/State';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';

class StateActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<GroupState>,
    private _requestController: IRequestController<GroupState>,
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {}

  async updateReadStatus(groupId: number, readStatus: boolean): Promise<void> {}

  async updateLastGroup(groupId: number): Promise<void> {}
}

export { StateActionController };
