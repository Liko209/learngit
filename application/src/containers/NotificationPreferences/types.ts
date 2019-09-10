/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-14 17:01:25
 * Copyright © RingCentral. All rights reserved.
 */

import ConversationPreferenceModel from '@/store/models/ConversationPreference';

type Props = {
  groupId: number;
};

type ViewProps = {
  isTeam: boolean;
  loading: boolean;
  currentValue: ConversationPreferenceModel;
  soundNotificationsDisabled: boolean;
  handleCheckboxChange: (item: string) => () => void;
  handleSelectChange: <T>(
    item: string,
  ) => (newValue: string, rawValue: T) => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
};

export { Props, ViewProps };
