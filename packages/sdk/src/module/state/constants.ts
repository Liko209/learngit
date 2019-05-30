/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:45:28
 * Copyright © RingCentral. All rights reserved.
 */

enum TASK_DATA_TYPE {
  STATE,
  GROUP_STATE,
  GROUP_CURSOR,
  GROUP_ENTITY,
  PROFILE_ENTITY,
}

const ModuleName = 'GroupState';

const GROUP_BADGE_TYPE = {
  TEAM: `${ModuleName}.TEAM`,
  DIRECT_MESSAGE: `${ModuleName}.DIRECT_MESSAGE`,
  FAVORITE_TEAM: `${ModuleName}.FAVORITE_TEAM`,
  FAVORITE_DM: `${ModuleName}.FAVORITE_DM`,
};

export { TASK_DATA_TYPE, ModuleName, GROUP_BADGE_TYPE };
