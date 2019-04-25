/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:12:02
 * Copyright © RingCentral. All rights reserved.
 */

import ConferenceItemModel from '@/store/models/ConferenceItem';

type Props = {
  ids: number[];
};

type ViewProps = {
  conference: ConferenceItemModel;
  isHostByMe: boolean;
  globalNumber: string;
};

export { Props, ViewProps };
