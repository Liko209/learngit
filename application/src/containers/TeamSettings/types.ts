/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:08
 * Copyright © RingCentral. All rights reserved.
 */

type SaveParams = {
  name: string;
  description: string;
};
type TeamSettingTypes = {
  name: string;
  description: string;
};
type ViewProps = {
  initialData: TeamSettingTypes;
  id: number;
  isAdmin: boolean;
  save: (params: SaveParams) => void;
  nameError?: boolean;
  nameErrorMsg?: string;
  leaveTeam: () => void;
};

export { ViewProps, SaveParams };
