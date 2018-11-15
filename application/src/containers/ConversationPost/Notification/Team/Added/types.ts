/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:29:41
 * Copyright © RingCentral. All rights reserved.
 */

type AddedProps = {
  id: number;
};

type AddedViewProps = {
  inviterId: number;
  inviterName: string;
  newUserId: number;
  newUserName: string;
  createdAt: string;
};

export { AddedProps, AddedViewProps };
