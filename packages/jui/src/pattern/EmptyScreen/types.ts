/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-07 13:30:41
 * Copyright © RingCentral. All rights reserved.
 */

type JuiEmptyScreenProps = {
  image: string;
  text: string;
  actions: JSX.Element[];
  content?: string;
};

type JuiMemberListEmptyViewProps = {
  image: string;
  subText: string;
};

export { JuiEmptyScreenProps, JuiMemberListEmptyViewProps };
