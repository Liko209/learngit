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

const OpenDialogE911 = () => {
  Dialog.simple(<E911 />, {
    scroll: 'body',
  });
};

export { E911, OpenDialogE911 };
