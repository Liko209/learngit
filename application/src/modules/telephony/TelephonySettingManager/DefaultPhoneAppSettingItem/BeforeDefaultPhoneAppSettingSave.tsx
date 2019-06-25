/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-24 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import React from 'react';
import { Dialog } from '@/containers/Dialog';
import i18nT from '@/utils/i18nT';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { getSingleEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';

const beforeDefaultPhoneAppSettingSave = async (value: any) => {
  const currentValue = getSingleEntity(ENTITY_NAME.PROFILE, 'callOption');
  if (
    value === CALLING_OPTIONS.RINGCENTRAL &&
    currentValue !== CALLING_OPTIONS.RINGCENTRAL
  ) {
    const confirmDialogPromise: Promise<boolean> = new Promise(
      async (resolve, reject) => {
        Dialog.confirm({
          modalProps: {
            'data-test-automation-id': 'defaultPhoneAppConfirmDialog',
          },
          okBtnProps: {
            'data-test-automation-id': 'defaultPhoneAppOkButton',
          },
          cancelBtnProps: {
            'data-test-automation-id': 'defaultPhoneAppCancelButton',
          },
          title: await i18nT('message.prompt.changeDefaultPhoneAppTitle'),
          content: (
            <JuiDialogContentText>
              {i18nT('message.prompt.changeDefaultPhoneAppContent')}
            </JuiDialogContentText>
          ),
          okText: await i18nT('common.dialog.OK'),
          cancelText: await i18nT('common.dialog.cancel'),
          onCancel() {
            resolve(false);
          },
          onOK() {
            resolve(true);
          },
        });
      },
    );

    const result = await confirmDialogPromise;
    return result;
  }
  return true;
};

export { beforeDefaultPhoneAppSettingSave };
