/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:08
 * Copyright © RingCentral. All rights reserved.
 */

type TeamSettingTypes = {
  name: string;
  description: string;
  allowMemberAddMember: boolean;
};
type ViewProps = {
  initialData: TeamSettingTypes;
  id: number;
  isAdmin: boolean;
  save: (params: TeamSettingTypes) => boolean;
  nameErrorMsg?: string;
};

export { ViewProps, TeamSettingTypes };
