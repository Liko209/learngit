/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-17 15:42:26
 * Copyright © RingCentral. All rights reserved.
 */

import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';
import { Raw } from 'sdk/framework/model';
import { Presence } from '../entity';
import { PRESENCE, PRESENCE_REQUEST_STATUS } from '../constant';
import PresenceAPI from 'sdk/api/glip/presence';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { IPartialEntitySourceController } from 'sdk/framework/controller/interface/IPartialEntitySourceController';
import { ENTITY } from 'sdk/service';
import { PresenceController } from './PresenceController';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';

class PresenceActionController {
  private _partialModifyController: IPartialModifyController<Presence, number>;
  constructor(private _presenceController: PresenceController) {
    this._initPartialController();
  }
  private _initPartialController() {
    const entitySourceController: IPartialEntitySourceController<
      Presence,
      number
    > = {
      getEntityNotificationKey: () => ENTITY.PRESENCE,
      get: async (id: number) => await this._presenceController.getById(id),
      update: async (presence: Presence) => {
        await this._presenceController.updatePresence(presence);
      },
    };
    this._partialModifyController = new PartialModifyController(
      entitySourceController,
    );
  }

  async setPresence(status: PRESENCE) {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentId = userConfig.getGlipUserId();
    const preHandlePartial = (
      partialModel: Partial<Raw<Presence>>,
    ): Partial<Raw<Presence>> => {
      partialModel.presence = status;
      return partialModel;
    };
    await this._partialModifyController.updatePartially({
      entityId: currentId,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newData: Presence) => {
        return PresenceAPI.setPresence(newData);
      },
    });
  }

  async setAutoPresence(presence: PRESENCE) {
    const status =
      presence === PRESENCE.UNAVAILABLE
        ? PRESENCE_REQUEST_STATUS.AWAY
        : PRESENCE_REQUEST_STATUS.ONLINE;
    // response of this api doesn't have status_code
    await PresenceAPI.setAutoPresence(status).catch(() => {});
  }
}
export { PresenceActionController };
