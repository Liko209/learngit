/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import EventItemModel from '@/store/models/EventItem';

type Props = {
  id: number;
};

type ViewProps = {
  text: string;
  startTime: string;
  event: EventItemModel;
  isRepeat: boolean;
};

export { Props, ViewProps };
