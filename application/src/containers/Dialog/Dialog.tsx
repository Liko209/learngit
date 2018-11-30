/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDismiss } from '@/common/genDivAndDismiss';
import ThemeProvider from '@/containers/ThemeProvider';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';

type Props = {
  componentProps?: any;
} & JuiDialogProps;

function dialog(component: React.ComponentType<any>, props: Props) {
  const Component = component;
  const { container, dismiss } = genDivAndDismiss();

  function render(currentProps: Props) {
    const { componentProps, ...rest } = currentProps;

    ReactDOM.render(
      <ThemeProvider>
        <JuiDialog {...rest}>
          <Component {...componentProps} dismiss={dismiss} />
        </JuiDialog>
      </ThemeProvider>,
      container,
    );
  }

  render(props);

  return {
    dismiss,
  };
}

export { dialog };
