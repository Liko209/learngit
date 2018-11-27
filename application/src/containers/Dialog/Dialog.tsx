/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-21 13:28:06
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { genDivAndDestroy } from '@/common/genDivAndDestroy';
import ThemeProvider from '@/containers/ThemeProvider';
import { JuiDialog, JuiDialogProps } from 'jui/components/Dialog';

type Props = {
  componentProps?: any;
} & JuiDialogProps;

function dialog(component: React.ComponentType<any>, config: Props) {
  const Component = component;
  const { container, destroy } = genDivAndDestroy();

  function render(currentConfig: Props) {
    const { componentProps, ...rest } = currentConfig;
    ReactDOM.render(
      <ThemeProvider>
        <JuiDialog {...rest}>
          <Component {...componentProps} destroy={destroy} />
        </JuiDialog>
      </ThemeProvider>,
      container,
    );
  }

  render(config);

  return {
    destroy,
  };
}

export { dialog };
