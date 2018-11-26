/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:32:17
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {
  id: number;
  children?: React.ReactNode;
};

type ViewProps = {
  conversationId: number;
  getConversationId: () => void;
};

export { Props, ViewProps };
