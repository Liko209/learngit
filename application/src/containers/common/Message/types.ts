/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

type MessageProps = {
  id: number; // personId || conversationId
  render: () => any;
  afterClick?: () => void;
};

type MessageViewProps = {
  id: number; // personId || conversationId
};

export { MessageProps, MessageViewProps };
