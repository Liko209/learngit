/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:40:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RouteComponentProps } from 'react-router-dom';

type MessagesProps = {};

type MessagesViewProps = {
  isLeftNavOpen: boolean,
} & RouteComponentProps<{ id: string }>;

export { MessagesProps, MessagesViewProps };
