/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:11:55
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { TypeDictionary } from 'sdk/utils';
import { Conference } from './';

type Props = {
  ids: number[];
};

export default {
  priority: 1,
  component: observer((props: Props) => {
    const { ids } = props;
    return <Conference ids={ids} />;
  }),
  type: TypeDictionary.TYPE_ID_CONFERENCE,
  breakIn: true,
};
