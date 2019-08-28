/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:42:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileDataController } from './ProfileDataController';
import { ProfileActionController } from './ProfileActionController';
import { SettingsActionController } from './SettingsActionController';
import {
  buildRequestController,
  buildPartialModifyController,
} from '../../../framework/controller';
import Api from '../../../api/api';
import { Profile } from '../entity';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { ProfileEntityObservable } from './ProfileEntityObservable';

class ProfileController {
  private profileActionController: ProfileActionController;
  private profileDataController: ProfileDataController;
  private settingsActionController: SettingsActionController;
  private _requestController: IRequestController<Profile>;
  private _partialModifyController: IPartialModifyController<Profile>;
  private _profileEntityObservable: ProfileEntityObservable;
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
    public entityCacheController: IEntityCacheController<Profile>,
  ) {}

  private get requestController(): IRequestController<Profile> {
    if (!this._requestController) {
      this._requestController = buildRequestController<Profile>({
        basePath: '/profile',
        networkClient: Api.glipNetworkClient,
      });
    }
    return this._requestController;
  }

  private get partialModifyController(): IPartialModifyController<Profile> {
    if (!this._partialModifyController) {
      this._partialModifyController = buildPartialModifyController<Profile>(
        this.entitySourceController,
      );
    }
    return this._partialModifyController;
  }

  getProfileActionController(): ProfileActionController {
    if (!this.profileActionController) {
      this.profileActionController = new ProfileActionController(
        this.partialModifyController,
        this.requestController,
        this.getProfileDataController(),
      );
    }
    return this.profileActionController;
  }

  getProfileDataController(): ProfileDataController {
    if (!this.profileDataController) {
      this.profileDataController = new ProfileDataController(
        this.entitySourceController,
        this.entityCacheController,
        this.getProfileEntityObservable()
      );
    }
    return this.profileDataController;
  }

  getSettingsActionController(): SettingsActionController {
    if (!this.settingsActionController) {
      this.settingsActionController = new SettingsActionController(
        this.partialModifyController,
        this.requestController,
        this.getProfileDataController(),
      );
    }
    return this.settingsActionController;
  }
  getProfileEntityObservable(): ProfileEntityObservable {
    if (!this._profileEntityObservable) {
      this._profileEntityObservable = new ProfileEntityObservable();
    }
    return this._profileEntityObservable;
  }

}

export { ProfileController };
