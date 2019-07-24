/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:26:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { buildContainer } from '@/base';
import { Dialog } from '@/containers/Dialog';
import { E911View } from './E911.View';
import { E911ViewModel } from './E911.ViewModel';
import { E911Props } from './types';

const E911 = buildContainer<E911Props>({
  View: E911View,
  ViewModel: E911ViewModel,
});

const OpenE911 = () => {
  Dialog.confirm({
    title: 'Confirm address for emergency calls',
    content: <E911 />,
    modalProps: {
      scroll: 'body',
    },
  });
};

export { E911, OpenE911 };
