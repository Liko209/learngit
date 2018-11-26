/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 15:32:17
 * Copyright © RingCentral. All rights reserved.
 */

type ChildrenProps = {
  jumpToConversation: (id: number) => void;
};

type Props = {
  id: number;
  onSuccess?: () => void;
  children(props: ChildrenProps): JSX.Element;
};

type ViewProps = {
  id: number;
  getConversationId: (id: number) => Promise<number>;
  onSuccess?: () => void;
  children(props: ChildrenProps): JSX.Element;
};

export { Props, ViewProps };
