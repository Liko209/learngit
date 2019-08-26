/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:26:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { container } from 'framework/ioc';
import { buildContainer } from '@/base';
import { Dialog } from '@/containers/Dialog';
import { E911View } from './E911.View';
import { E911ViewModel } from './E911.ViewModel';
import { E911Props } from './types';
import { TelephonyStore } from '../../store';

const E911 = buildContainer<E911Props>({
  View: E911View,
  ViewModel: E911ViewModel,
});

const OpenDialogE911 = (successCallback?: Function) => {
  const { dismiss } = Dialog.simple(
    <E911 successCallback={successCallback} />,
    {
      scroll: 'body',
      onClose: () => {
        dismiss();
        container.get(TelephonyStore).switchE911Status(false);
      },
    },
  );
};

export { E911, OpenDialogE911 };
