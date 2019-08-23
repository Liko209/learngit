/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';
import { dataAnalysis } from 'foundation/analysis';

type Props = {
  componentProps?: any;
} & JuiDialogProps;

function modal(
  component: React.ComponentType<any> | JSX.Element,
  props: Props,
) {
  const onClose = () => {
    dataAnalysis.track('Jup_Web/DT_general_kbShortcuts', {
      shortcut: 'escape',
    });
    portalManager.dismissLast();
  };
  const Component = component;
  const Dialog = () => (
    <JuiDialog {...props} onClose={onClose}>
      {Component instanceof Function ? <Component /> : Component}
    </JuiDialog>
  );

  const { dismiss, show } = portalManager.wrapper(Dialog);

  show();
  return {
    dismiss,
  };
}

export { modal };
