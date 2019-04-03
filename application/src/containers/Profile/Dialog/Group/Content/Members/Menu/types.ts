/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */

type props = {
  personId: number;
  groupId: number;
};

type MenuViewModelProps = props & {
  removeFromTeam: () => void;
  toggleTeamAdmin: () => void;
};

type MenuProps = props & {
  isCurrentUserSelf: boolean;
  onMenuClose: () => void;
  isThePersonGuest: boolean;
  isThePersonAdmin: boolean;
};

type MenuViewProps = MenuViewModelProps & MenuProps;

export { MenuProps, MenuViewProps, MenuViewModelProps };
