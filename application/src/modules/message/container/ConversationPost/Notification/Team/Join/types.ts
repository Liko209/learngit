/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:29:41
 * Copyright © RingCentral. All rights reserved.
 */

type JoinProps = {
  id: number;
};

type JoinViewProps = {
  newUserId: number;
  newUserName: string;
  createdAt: string;
};

export { JoinProps, JoinViewProps };
