/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright Â© RingCentral. All rights reserved.
 */

import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile';
import { i18nP } from '@/utils/i18nT';

type BadgeCountItemProps = {
  value: NEW_MESSAGE_BADGES_OPTIONS;
};

const BadgeCountSourceItem = (props: BadgeCountItemProps) => {
  const { value } = props;
  return i18nP(
    `setting.Messages.conversationList.newMessageBadgeCount.options.${value}`,
  );
};

export { BadgeCountSourceItem };
