/*
 * @Author: Andy Hu(Andy.Hu@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright Â© RingCentral. All rights reserved.
 */
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { withTranslation, WithTranslation } from 'react-i18next';
import React, { SFC, useEffect, useRef, useCallback } from 'react';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { getSingleEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';
import { noop } from 'jui/foundation/utils';

type DefaultPhoneAppSelectItemProps = {
  value: CALLING_OPTIONS;
};

const DefaultPhoneAppSelectItem: SFC<
  DefaultPhoneAppSelectItemProps & WithTranslation
> = ({ value, t }) => {
  // to-do: This dialog logic should be moved into settings built-in component
  const optionRef = useRef<HTMLDivElement>(null);
  const onClickHandler = useCallback((e: MouseEvent) => {
    let currentTarget = e.currentTarget;
    const currentValue = getSingleEntity(ENTITY_NAME.PROFILE, 'callOption');
    if (!e.detail) {
      return;
    }
    if (
      value === CALLING_OPTIONS.RINGCENTRAL &&
      currentValue !== CALLING_OPTIONS.RINGCENTRAL
    ) {
      e.stopPropagation();
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
        title: t('message.prompt.changeDefaultPhoneAppTitle'),
        content: (
          <JuiDialogContentText>
            {t('message.prompt.changeDefaultPhoneAppContent')}
          </JuiDialogContentText>
        ),
        okText: t('common.dialog.OK'),
        cancelText: t('common.dialog.cancel'),
        onCancel() {
          currentTarget = null;
          const settingsPopUp = document.querySelector('#menu-settings');
          const backdrop =
            settingsPopUp && (settingsPopUp.firstElementChild as HTMLElement);
          if (backdrop) {
            window.requestAnimationFrame(() => backdrop.click());
          }
        },
        onOK() {
          const clickEv = new MouseEvent('click', {
            bubbles: true,
            detail: 0,
          });
          currentTarget && currentTarget.dispatchEvent(clickEv);
          currentTarget = null;
        },
      });
    }
  },                                 []);
  useEffect(() => {
    const divEl = optionRef.current;
    const selectItemList = divEl ? divEl.parentElement : null;
    if (selectItemList) {
      selectItemList.addEventListener('click', onClickHandler);
      return () => selectItemList.removeEventListener('click', onClickHandler);
    }
    return noop;
  },        []);

  const options = {
    [CALLING_OPTIONS.GLIP]: t(
      'setting.phone.general.defaultPhoneApp.option.glip',
    ),
    [CALLING_OPTIONS.RINGCENTRAL]: t(
      'setting.phone.general.defaultPhoneApp.option.ringcentral',
    ),
  };
  return <div ref={optionRef}>{options[value]}</div>;
};

const withTranslationComp = withTranslation()(DefaultPhoneAppSelectItem);

export {
  withTranslationComp as DefaultPhoneAppSelectItem,
  DefaultPhoneAppSelectItemProps,
};
