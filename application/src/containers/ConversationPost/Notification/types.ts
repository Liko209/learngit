/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:30:06
 * Copyright © RingCentral. All rights reserved.
 */

type ActivityData = {
  [index: string]: any;
};

type NotificationProps = {
  id: number;
  onClick?: (e: React.MouseEvent) => void;
};

type NotificationViewProps = {
  id: number;
  activityData: ActivityData;
  onClick?: (e: React.MouseEvent) => void;
};

export { NotificationProps, NotificationViewProps, ActivityData };
