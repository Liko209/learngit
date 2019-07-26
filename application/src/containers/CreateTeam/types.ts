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
  canMentionTeam: boolean;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchContactChange: (items: any) => void;
  loading: boolean;
};

enum INIT_ITEMS {
  IS_PUBLIC = 'isPublic',
  CAN_ADD_MEMBER = 'canAddMember',
  CAN_POST = 'canPost',
  CAN_AT_TEAM_MENTION = 'canAtTeamMention',
  CAN_PIN = 'canPin',
}

export { ViewProps, INIT_ITEMS };
