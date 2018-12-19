/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:40:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RouteComponentProps } from 'react-router-dom';

type MessagesProps = RouteComponentProps<{ id: string }>;

type MessagesViewProps = {
  isLeftNavOpen: boolean;
  currentConversationId: number;
  updateCurrentConversationId: (id?: number | string) => void;
  getLastGroupId: () => Promise<number | undefined>;
} & RouteComponentProps<{ id: string }>;

export { MessagesProps, MessagesViewProps };
