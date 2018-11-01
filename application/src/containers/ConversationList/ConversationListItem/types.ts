/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:54:57
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import { CONVERSATION_TYPES } from '@/constants';

type ConversationListItemProps = {
  groupId: number;
};

type ConversationListItemViewProps = {
  groupId: number;
  displayName: string;
  selected: boolean;
  umiHint?: boolean;
  hidden?: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  groupType: CONVERSATION_TYPES;
  personId: number;
};

export { ConversationListItemProps, ConversationListItemViewProps };
