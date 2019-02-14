/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:42:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileDataController } from './ProfileDataController';
import { ProfileActionController } from './ProfileActionController';
import { daoManager } from '../../../dao';
import {
  buildRequestController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildPartialModifyController,
} from '../../../framework/controller';
import { ProfileDao } from '../dao';
import Api from '../../../api/api';
import { Profile } from '../entity';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class ProfileController {
  private profileActionController: ProfileActionController;
  private profileDataController: ProfileDataController;
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
  ) {}

  getProfileActionController(): ProfileActionController {
    if (!this.profileActionController) {
      const requestController = buildRequestController<Profile>({
        basePath: '/profile',
        networkClient: Api.glipNetworkClient,
      });

      const persistentController = buildEntityPersistentController<Profile>(
        daoManager.getDao(ProfileDao),
      );
      const entitySourceController = buildEntitySourceController<Profile>(
        persistentController,
        requestController,
      );

      const partialModifyController = buildPartialModifyController<Profile>(
        entitySourceController,
      );

      this.profileActionController = new ProfileActionController(
        partialModifyController,
        requestController,
        this.getProfileDataController(),
      );
    }
    return this.profileActionController;
  }

  getProfileDataController(): ProfileDataController {
    if (!this.profileDataController) {
      this.profileDataController = new ProfileDataController(
        this.entitySourceController,
      );
    }
    return this.profileDataController;
  }
}

export { ProfileController };
