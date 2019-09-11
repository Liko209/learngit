/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';
import { analyticsCollector } from '@/AnalyticsCollector';
import { SHORT_CUT_KEYS } from '@/AnalyticsCollector/constants';
import { CLOSE_REASON } from './constants';
import { withDialogLevel } from 'jui/hoc/withDialogLevel';
import { jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '@/modules/telephony/store/TelephonyStore';

const DialogView = withDialogLevel(JuiDialog);

type Props = {
  componentProps?: any;
} & JuiDialogProps;

function modal(
  component: React.ComponentType<any> | JSX.Element,
  props: Props,
  key?: string,
) {
  const { onClose, ...rest } = props;
  const defaultClose = (
    e: React.MouseEvent,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    if (onClose) {
      onClose && onClose(e);
    } else {
      portalManager.dismissLast();
    }
    if (reason === CLOSE_REASON.ESC) {
      analyticsCollector.shortcuts(SHORT_CUT_KEYS.ESCAPE);
    }
  };
  const Component = component;
  const store = jupiter.get(TelephonyStore);
  const canGoTop = !(store.isIncomingCall || store.call);
  const Dialog = () => (
    <DialogView {...rest} onClose={defaultClose} canGoTop={canGoTop}>
      {Component instanceof Function ? <Component /> : Component}
    </DialogView>
  );

  const { dismiss, show } = portalManager.wrapper(Dialog);

  if (key) {
    show({ key });
  } else {
    show();
  }
  return {
    dismiss,
  };
}

export { modal };
