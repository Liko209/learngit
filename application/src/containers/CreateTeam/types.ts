/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';
import { Group, TeamSetting } from 'sdk/module/group';

type ViewProps = WithTranslation & {
  create: (
    memberIds: (number | string)[],
    options: TeamSetting,
  ) => Promise<Group | null>;
  disabledOkBtn: boolean;
  isOffline: boolean;
  nameError: boolean;
  emailError: boolean;
  errorMsg: string;
  emailErrorMsg: string;
  teamName: string;
  description: string;
  serverError: boolean;
  members: (number | string)[];
  errorEmail: string;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchContactChange: (items: any) => void;
  loading: boolean;
};

export { ViewProps };
