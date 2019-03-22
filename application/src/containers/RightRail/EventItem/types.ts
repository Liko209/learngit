/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import EventItemModel from '@/store/models/EventItem';
import { Palette } from 'jui/foundation/theme/theme';

type Props = {
  id: number;
};

type ViewProps = {
  text: string;
  localTime: string;
  startTime: string;
  event: EventItemModel;
  isRepeat: boolean;
  color: [keyof Palette, string];
};

export { Props, ViewProps };
