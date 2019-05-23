/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type ActionsProps = {
  postId: number;
  groupId: number;
};

type ActionsViewProps = {
  isIntegration: boolean;
} & ActionsProps;

export { ActionsProps, ActionsViewProps };
