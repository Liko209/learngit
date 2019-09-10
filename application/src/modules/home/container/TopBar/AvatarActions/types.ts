/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { PRESENCE } from 'sdk/module/presence/constant';
import PersonModel from '@/store/models/Person';

type Props = {};

type ViewProps = {
  currentUserId: number;
  presence: PRESENCE;
  person: PersonModel;
  toggleAboutPage: (
    electronAppVersion?: string,
    electronVersion?: string,
  ) => void;
  handleSignOut: () => void;
  handleSendFeedback: () => void;
  handleCustomStatus: () => void;
  handleClearStatus: () => void;
  handleOpen: () => void;
  awayStatus: string;
  colons: string;
};

export { Props, ViewProps };
